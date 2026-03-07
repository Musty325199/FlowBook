import Service from "../models/Service.js";
import Business from "../models/Business.js";

export const createService = async (req, res, next) => {
  try {
    const imageUrl = req.file ? req.file.path : "";

    const service = await Service.create({
      name: req.body.name,
      price: req.body.price,
      duration: req.body.duration,
      description: req.body.description || "",
      category: req.body.category || "",
      image: imageUrl,
      business: req.user.business
    });

    res.status(201).json(service);
  } catch (err) {
    next(err);
  }
};

export const updateService = async (req, res, next) => {
  try {
    const updateData = {
      name: req.body.name,
      price: req.body.price,
      duration: req.body.duration,
      description: req.body.description,
      category: req.body.category
    };

    if (req.file) {
      updateData.image = req.file.path;
    }

    const service = await Service.findOneAndUpdate(
      { _id: req.params.id, business: req.user.business },
      updateData,
      { new: true }
    );

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json(service);
  } catch (err) {
    next(err);
  }
};

export const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findOneAndDelete({
      _id: req.params.id,
      business: req.user.business
    });

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json({ message: "Service deleted" });
  } catch (err) {
    next(err);
  }
};

export const getServices = async (req, res, next) => {
  try {
    const services = await Service.find({ business: req.user.business });
    res.json(services);
  } catch (err) {
    next(err);
  }
};

export const getServicesPublic = async (req, res, next) => {
  try {
    const business = await Business.findOne({ slug: req.params.slug });

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const services = await Service.find({ business: business._id }).select(
      "name price duration description image category"
    );

    res.json(services);
  } catch (err) {
    next(err);
  }
};