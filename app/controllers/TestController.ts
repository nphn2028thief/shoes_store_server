import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { ILoginInfo, IRegisterInfo, ITest } from '../types';
import handlers from '../utils/handlers';
import { loginValidate, registerValidate, testUpdate } from '../validations/auth';
import TestSchema from '../models/TestSchema';
import { signAccessToken } from '../jwt';
import mongoose from 'mongoose';

class TestController {
  public signUp = async (req: Request, res: Response) => {
    const { error, value } = registerValidate(req.body as IRegisterInfo);

    if (error) {
      return handlers.response.badRequest(res, error.details[0].message);
    }

    try {
      const accountExist = await TestSchema.findOne({ username: value.username });

      if (accountExist) {
        return handlers.response.conflict(res, 'Username Already Exist!');
      }

      const emailExist = await TestSchema.findOne({ email: value.email });

      if (emailExist) {
        return handlers.response.conflict(res, 'Email Already Exist!');
      }

      const hash = await bcrypt.hash(value.password, 12);

      await TestSchema.create({
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

    try {
      const accountExist = await TestSchema.findOne({ username: value.username });

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
      const accountInfo = await TestSchema.findById({ _id: accountId });

      if (!accountInfo) {
        return handlers.response.unauthorized(res);
      }

      //   const shippingAddresses = await ShippingAddressShema.find({ accountId }).select('-accountId');

      return res.json({
        _id: accountInfo._id,
        email: accountInfo.email,
        firstName: accountInfo.firstName,
        lastName: accountInfo.lastName,
        avatar: accountInfo.avatar,
        shippingAddresses: accountInfo.shippingAddresses,
      });
    } catch (error) {
      return handlers.response.error(res);
    }
  };

  public updateMe = async (req: Request, res: Response) => {
    const accountId = req.accountId;
    const { value } = testUpdate(
      req.body as {
        firstName: string;
        lastName: string;
        avatar: string;
        phone: string;
        address: string;
      },
    );

    try {
      if (value.phone || value.address) {
        const accountIsUpdated = await TestSchema.findByIdAndUpdate(
          {
            _id: accountId,
          },
          {
            $push: {
              shippingAddresses: {
                phone: value.phone,
                address: value.address,
              },
            },
          },
          { new: true },
        );

        if (!accountIsUpdated) {
          return handlers.response.unauthorized(res);
        }

        return handlers.response.success(res, 'Update Personal Info Successfully!', 'data', {
          _id: accountIsUpdated._id,
          email: accountIsUpdated.email,
          firstName: accountIsUpdated.firstName,
          lastName: accountIsUpdated.lastName,
          avatar: accountIsUpdated.avatar,
          shippingAddresses: accountIsUpdated.shippingAddresses,
        });
      }

      if (value.firstName || value.lastName || value.avatar) {
        const accountIsUpdated = await TestSchema.findByIdAndUpdate(
          {
            _id: accountId,
          },
          {
            $set: {
              firstname: value.firstname,
              lastname: value.lastname,
              avatar: value.avatar,
            },
          },
          { new: true },
        );

        if (!accountIsUpdated) {
          return handlers.response.unauthorized(res);
        }

        // const shippingAddresses = await ShippingAddressShema.find({ accountId }).select('-accountId');

        return handlers.response.success(res, 'Update Personal Info Successfully!', 'data', {
          _id: accountIsUpdated._id,
          email: accountIsUpdated.email,
          firstName: accountIsUpdated.firstName,
          lastName: accountIsUpdated.lastName,
          avatar: accountIsUpdated.avatar,
          shippingAddresses: accountIsUpdated.shippingAddresses,
        });
      }

      return handlers.response.badRequest(res);
    } catch (error) {
      return handlers.response.error(res);
    }
  };

  public getShippingAddressById = async (req: Request, res: Response) => {
    const accountId = req.accountId;
    const shippingAddressId = req.params.shippingAddressId as string;

    if (!shippingAddressId || !mongoose.Types.ObjectId.isValid(shippingAddressId)) {
      return handlers.response.badRequest(res);
    }

    try {
      const info = await TestSchema.findById(accountId).select('-_id shippingAddresses');

      if (!info) {
        return res.json('failed');
      }

      let address;

      for (let i = 0; i < info.shippingAddresses.length; i++) {
        if (String(info.shippingAddresses[i]._id) === shippingAddressId) {
          address = info.shippingAddresses[i];
        }
      }

      return res.json(address);
    } catch (error) {
      return handlers.response.error(res);
    }
  };

  public updateShippingAddress = async (req: Request, res: Response) => {
    const accountId = req.accountId;
    const shippingAddressId = req.params.shippingAddressId as string;
    const { phone, address } = req.body as { phone: string; address: string };

    if (!shippingAddressId || !mongoose.Types.ObjectId.isValid(shippingAddressId)) {
      return handlers.response.badRequest(res);
    }

    try {
      // const addressIsUpdated = await TestSchema.findOneAndUpdate(
      //   {
      //     _id: accountId,
      //     shippingAddresses: {
      //       $elemMatch: {
      //         _id: shippingAddressId,
      //       },
      //     },
      //   },
      //   {
      //     $inc: {
      //       'shippingAddresses.$.phone': phone,
      //       'shippingAddresses.$.address': address,
      //     },
      //   },
      //   {
      //     new: true,
      //   },
      // );

      //   if (!addressIsUpdated) {
      //     return handlers.response.notFound(res, 'Address is not found!');
      //   }

      //   return handlers.response.success(res, 'Update Shipping Address Successfully!', 'data', addressIsUpdated);

      const info = await TestSchema.findById(accountId).select('-_id shippingAddresses');

      if (!info) {
        return res.json('failed');
      }

      //   for (let i = 0; i < info.shippingAddresses.length; i++) {
      //     if (String(info.shippingAddresses[i]._id) === shippingAddressId) {
      //       info.shippingAddresses[i].phone = phone;
      //       info.shippingAddresses[i].address = address;
      //       newAddress = info.shippingAddresses[i];
      //     }
      //   }

      const newAddress = await TestSchema.findOneAndUpdate(
        {
          //   _id: accountId,
          'info.shippingAddresses.$._id': shippingAddressId,
        },
        {
          $set: {
            'info.shippingAddresses.$.phone': phone,
            'info.shippingAddresses.$.address': address,
          },
        },
        {
          new: true,
        },
      );

      res.json(newAddress);
    } catch (error) {
      return handlers.response.error(res);
    }
  };
}

export default new TestController();
