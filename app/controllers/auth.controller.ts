import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import nodemailer from 'nodemailer';
import otpGenerator from 'otp-generator';
import envConfig from '../configs/envConfig';
import { signAccessToken } from '../jwt';
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

      const mailOption = {
        from: envConfig.mailEmail,
        to: value.email,
        subject: 'Forgot Password',
        // text: `${generator} <br /> Your OTP is valid in 5 minutes`,
        html: `<div
                style="
                  min-height: 100vh;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  background-color: #f5f6f7;
                "
              >
                <div style="width: 600px; background-color: white">
                  <div style="padding: 10px 16px; border-bottom: 1px solid #ccc">
                    <img
                      src=""
                      style="width: 148px; height: 36px; object-fit: cover"
                      alt="logo"
                    />
                  </div>
      
                  <div
                    style="
                      display: flex;
                      flex-direction: column;
                      gap: 28px;
                      padding: 56px 16px;
                    "
                  >
                    <h4 style="text-transform: capitalize; font-weight: bold">
                      reset password
                    </h4>
      
                    <p>
                      A password reset event has been triggered. The password reset otp is
                      limited to five minutes.
                    </p>
          
                    <p>
                      If you do not reset your password within five minutes, you will need
                      to submit a new request.
                    </p>
          
                    <p>
                      To complete the password reset process, fill the otp out the form:
                    </p>
      
                    <p>Your OTP: <span style="font-weight: bold;">${generator}</span> </p>
      
                    <div style="display: flex; flex-direction: column; gap: 8px">
                      <div style="display: flex; gap: 8px">
                        <p style="min-width: 52px">Email</p>
                        <p>${value.email}</p>
                      </div>
                      <div style="display: flex; gap: 8px">
                        <p style="min-width: 52px">Created</p>
                        <p>2023/06/14 09:39 GMT</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>`,
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
