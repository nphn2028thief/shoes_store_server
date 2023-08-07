import { Request, Response } from 'express';
import mongoose from 'mongoose';
import AccountSchema from '../models/AccountSchema';
import ShippingAddressShema from '../models/ShippingAddressShema';
import { IShippingAddress } from '../types/address';
import handlers from '../utils/handlers';
import { shippingAddressValidate } from '../validations/address';

class ShippingAddressController {
  public createShippingAddress = async (req: Request, res: Response) => {
    const accountId = req.accountId;
    const { error, value } = shippingAddressValidate(req.body as Omit<IShippingAddress, 'accountId'>);

    if (error) {
      return handlers.response.badRequest(res);
    }

    try {
      const newShippingAddress = await ShippingAddressShema.create({
        accountId,
        phone: value.phone,
        address: value.address,
      });

      await AccountSchema.findByIdAndUpdate(
        {
          _id: accountId,
        },
        {
          $push: {
            shippingAddresses: newShippingAddress._id,
          },
        },
        {
          new: true,
        },
      );

      return handlers.response.success(res, 'Create shipping address successfully!', 'data', newShippingAddress);
    } catch (error) {
      return handlers.response.error(res);
    }
  };

  public getShippingAddresses = async (req: Request, res: Response) => {
    const accountId = req.accountId;

    try {
      const addresses = await ShippingAddressShema.find({ accountId });

      // for (let index = 0; index < addresses.length; index++) {
      //   if (addresses[index]._id === req.body.shippingId) {
      //     await AccountSchema.findOneAndUpdate(
      //       {
      //         'shippingAddresses.$_id': req.body.shippingId,
      //       },
      //       {
      //         $set: {
      //           'shippingAddresses.$.phone': '123',
      //           'shippingAddresses.$.address': 'sdfdsf',
      //         },
      //       },
      //       {
      //         new: true,
      //       },
      //     );
      //   }
      // }

      return res.json(addresses);
    } catch (error) {
      return handlers.response.error(res);
    }
  };

  public getShippingAddressById = async (req: Request, res: Response) => {
    const accountId = req.accountId;
    const { shippingAddressId } = req.params as { shippingAddressId: string };

    if (!shippingAddressId || !mongoose.Types.ObjectId.isValid(shippingAddressId)) {
      return handlers.response.badRequest(res);
    }

    try {
      const address = await ShippingAddressShema.findOne({
        accountId,
        _id: shippingAddressId,
      });

      return res.json(address);
    } catch (error) {
      return handlers.response.error(res);
    }
  };

  public updateShippingAddress = async (req: Request, res: Response) => {
    const accountId = req.accountId;
    const { shippingAddressId } = req.params as { shippingAddressId: string };
    const { error, value } = shippingAddressValidate(req.body as Omit<IShippingAddress, 'accountId'>);

    if (!shippingAddressId || !mongoose.Types.ObjectId.isValid(shippingAddressId)) {
      return handlers.response.badRequest(res);
    }

    if (error) {
      return handlers.response.badRequest(res);
    }

    try {
      const shippingAddress = await ShippingAddressShema.findOneAndUpdate(
        {
          _id: shippingAddressId,
          accountId,
        },
        {
          $set: {
            phone: value.phone,
            address: value.address,
          },
        },
        {
          new: true,
        },
      );

      if (!shippingAddress) {
        return handlers.response.notFound(res, 'Shipping address is not exist!');
      }

      return handlers.response.success(res, 'Update shipping address successfully!', 'data', shippingAddress);
    } catch (error) {
      return handlers.response.error(res);
    }
  };

  public deleteShippingAddress = async (req: Request, res: Response) => {
    const accountId = req.accountId;
    const { shippingAddressId } = req.params as { shippingAddressId: string };

    if (!shippingAddressId || !mongoose.Types.ObjectId.isValid(shippingAddressId)) {
      return handlers.response.badRequest(res);
    }

    try {
      const shippingAddress = await ShippingAddressShema.findOneAndDelete({ _id: shippingAddressId, accountId });

      if (!shippingAddress) {
        return handlers.response.notFound(res, 'Shipping address is not exist!');
      }

      await AccountSchema.findByIdAndUpdate(
        {
          _id: accountId,
        },
        {
          $pull: {
            shippingAddresses: shippingAddressId,
          },
        },
        {
          new: true,
        },
      );

      return handlers.response.success(
        res,
        'Delete shipping address successfully!',
        'shippingAddressId',
        shippingAddressId,
      );
    } catch (error) {
      return handlers.response.error(res);
    }
  };
}

export default new ShippingAddressController();
