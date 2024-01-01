import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import otpGenerator from 'otp-generator';
import fs from 'fs';
import handlebars from 'handlebars';

import envConfig from '../configs/envConfig';
import { signAccessToken } from '../jwt/index';
import AccountSchema from '../models/AccountSchema';
import ShippingAddressShema from '../models/ShippingAddressShema';
import { IAccount, ILoginInfo, IRegisterInfo, IResetPassword } from '../types';
import handlers from '../utils/handlers';
import {
  emailValidate,
  loginValidate,
  otpValidate,
  registerValidate,
  resetPasswordValidate,
  updateMeValidate,
} from '../validations/auth';

class AuthController {
  public signUp = async (req: Request, res: Response) => {
    const { error, value } = registerValidate(req.body as IRegisterInfo);

    if (error) {
      return handlers.response.badRequest(res, error.details[0].message);
    }

    try {
      const accountExist = await AccountSchema.findOne({ username: value.username });

      if (accountExist) {
        return handlers.response.conflict(res, 'Username Already Exist!');
      }

      const emailExist = await AccountSchema.findOne({ email: value.email });

      if (emailExist) {
        return handlers.response.conflict(res, 'Email Already Exist!');
      }

      const hash = await bcrypt.hash(value.password, 12);

      await AccountSchema.create({
        email: value.email,
        username: value.username,
        password: hash,
        firstName: value.firstName,
        lastName: value.lastName,
      });

      return handlers.response.success(res, 'Register Successfully!');
    } catch (error) {
      return handlers.response.error(res, 'Register Failure!');
    }
  };

  public signIn = async (req: Request, res: Response) => {
    const { error, value } = loginValidate(req.body as ILoginInfo);

    if (error) {
      return handlers.response.badRequest(res, error.details[0].message);
    }

    console.log(value);

    try {
      const accountExist = await AccountSchema.findOne({ username: value.username });

      if (!accountExist) {
        return handlers.response.notFound(res, 'Username or Password is not Correct!');
      }

      const match = await bcrypt.compare(value.password, accountExist.password);

      if (!match) {
        return handlers.response.notFound(res, 'Username or Password is not Correct!');
      }

      const accessToken = await signAccessToken(accountExist._id);

      return handlers.response.success(res, 'Login Successfully!', 'accessToken', accessToken);
    } catch (error) {
      return handlers.response.error(res, 'Login Failure!');
    }
  };

  public getMe = async (req: Request, res: Response) => {
    const accountId = req.accountId;

    try {
      const accountInfo = await AccountSchema.findById({ _id: accountId });

      if (!accountInfo) {
        return handlers.response.unauthorized(res);
      }

      const shippingAddresses = await ShippingAddressShema.find({ accountId }).select('-accountId');

      return res.json({
        _id: accountInfo._id,
        email: accountInfo.email,
        firstName: accountInfo.firstName,
        lastName: accountInfo.lastName,
        avatar: accountInfo.avatar,
        shippingAddresses,
      });
    } catch (error) {
      return handlers.response.error(res);
    }
  };

  public updateMe = async (req: Request, res: Response) => {
    const accountId = req.accountId;
    const { value } = updateMeValidate(req.body as Pick<IAccount, 'firstName' | 'lastName' | 'avatar'>);

    try {
      if (value.firstName || value.lastName || value.avatar) {
        const accountIsUpdated = await AccountSchema.findByIdAndUpdate(
          {
            _id: accountId,
          },
          {
            $set: {
              firstName: value.firstName,
              lastName: value.lastName,
              avatar: value.avatar,
            },
          },
          { new: true },
        );

        if (!accountIsUpdated) {
          return handlers.response.unauthorized(res);
        }

        const shippingAddresses = await ShippingAddressShema.find({ accountId }).select('-accountId');

        return handlers.response.success(res, 'Update Personal Info Successfully!', 'data', {
          _id: accountIsUpdated._id,
          email: accountIsUpdated.email,
          firstName: accountIsUpdated.firstName,
          lastName: accountIsUpdated.lastName,
          avatar: accountIsUpdated.avatar,
          shippingAddresses,
        });
      }

      return handlers.response.badRequest(res);
    } catch (error) {
      return handlers.response.error(res);
    }
  };

  public forgorPassword = async (req: Request, res: Response) => {
    const { error, value } = emailValidate(req.body as { email: string });

    if (error) {
      return handlers.response.badRequest(res, error.details[0].message);
    }

    try {
      const emailExist = await AccountSchema.findOne({ email: value.email });

      if (!emailExist) {
        return handlers.response.notFound(res, 'Email is not Found!');
      }

      const generator = otpGenerator.generate(6, {
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });

      const source = fs.readFileSync('app/views/send-mail.html', 'utf-8').toString();
      const template = handlebars.compile(source);
      const html = template({
        otp: generator,
      });

      await AccountSchema.findOneAndUpdate(
        {
          email: value.email,
        },
        {
          $set: {
            otp: generator,
            expiresIn: Date.now() + 5 * 60 * 1000,
          },
        },
        { new: true },
      );

      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        service: 'Gmail',
        port: 465,
        secure: true,
        auth: {
          user: envConfig.mailEmail,
          pass: envConfig.mailPassword,
        },
      });

      const mailOption: Mail.Options = {
        from: `Nguyen Nhan Admin <${envConfig.mailEmail}>`,
        to: value.email,
        subject: 'Verify Your OTP',
        html,
      };

      await transporter.sendMail(mailOption);

      return handlers.response.success(res, 'Send Otp Successfully, Please Check Your Email!');
    } catch (error) {
      return handlers.response.error(res);
    }
  };

  public verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = otpValidate(req.body as { email: string; otp: number });

    if (error) {
      return handlers.response.badRequest(res, error.details[0].message);
    }

    try {
      const userExist = await AccountSchema.findOne({
        email: value.email,
        otp: value.otp,
        expiresIn: { $gt: Date.now() },
      });

      if (!userExist) {
        return res.send({
          message: 'OTP is Expired, Please Try Again!',
        });
      }

      return next(res.send('OK'));
    } catch (error) {
      return handlers.response.error(res);
    }
  };

  public resetPassword = async (req: Request, res: Response) => {
    const { error, value } = resetPasswordValidate(req.body as IResetPassword);

    if (error) {
      return handlers.response.badRequest(res, error.details[0].message);
    }

    try {
      const hash = await bcrypt.hash(value.confirmNewPassword, 12);

      await AccountSchema.findOneAndUpdate(
        {
          email: value.email,
        },
        {
          $set: {
            password: hash,
            otp: null,
            expiresIn: null,
          },
        },
        { new: true },
      );

      return handlers.response.success(res, 'Reset Password Successfully!');
    } catch (error) {
      return handlers.response.error(res);
    }
  };

  // public refreshToken = async (req: Request, res: Response) => {
  //   const accountId = req.accountId;

  //   try {
  //     const accountExist = await AccountSchema.findById({ _id: accountId });

  //     if (!accountExist) {
  //       return handlers.response.notFound(res, 'User not found!');
  //     }

  //     const accessToken = await signAccessToken(accountExist._id);
  //     const refreshToken = await signRefreshToken(accountExist._id);

  //     await AccountSchema.findByIdAndUpdate(
  //       {
  //         _id: accountId,
  //       },
  //       {
  //         $set: {
  //           refreshToken,
  //         },
  //       },
  //       { new: true },
  //     );

  //     return handlers.response.success(res, '', 'data', { accessToken, refreshToken });
  //   } catch (error) {
  //     return handlers.response.error(res);
  //   }
  // };
}

export default new AuthController();
