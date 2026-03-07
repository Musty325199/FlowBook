import Business from "../models/Business.js";

export const getBusiness = async (req, res, next) => {
  try {
    const business = await Business.findById(req.user.business);

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    res.json(business);
  } catch (err) {
    next(err);
  }
};

export const updateBusiness = async (req, res, next) => {
  try {
    const updates = req.body;

    const business = await Business.findById(req.user.business);

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    if (updates.name !== undefined) business.name = updates.name;
    if (updates.phone !== undefined) business.phone = updates.phone;
    if (updates.email !== undefined) business.email = updates.email;
    if (updates.description !== undefined)
      business.description = updates.description;
    if (updates.about !== undefined) business.about = updates.about;

if (updates.yearsOfExperience !== undefined)
  business.yearsOfExperience = updates.yearsOfExperience;

if (updates.specialties !== undefined)
  business.specialties = updates.specialties;
    if (updates.location !== undefined) business.location = updates.location;
    if (updates.autoConfirmBookings !== undefined)
      business.autoConfirmBookings = updates.autoConfirmBookings;
    if (updates.avatar !== undefined) business.avatar = updates.avatar;
    if (updates.coverImage !== undefined)
      business.coverImage = updates.coverImage;

    if (updates.workingHours) {
      Object.keys(updates.workingHours).forEach((day) => {
        if (!business.workingHours[day]) return;

        business.workingHours[day].open =
          updates.workingHours[day].open ?? business.workingHours[day].open;

        business.workingHours[day].close =
          updates.workingHours[day].close ?? business.workingHours[day].close;

        business.workingHours[day].closed =
          updates.workingHours[day].closed ?? business.workingHours[day].closed;
      });
    }

    if (req.file && req.file.fieldname === "avatar") {
      business.avatar = req.file.path;
    }

    if (req.file && req.file.fieldname === "coverImage") {
      business.coverImage = req.file.path;
    }

    await business.save();

    res.json(business);
  } catch (err) {
    next(err);
  }
};

export const getBusinessPublic = async (req, res, next) => {
  try {
    const business = await Business.findOne({ slug: req.params.slug });

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

      res.json({
        _id: business._id,
        name: business.name,
        phone: business.phone,
        email: business.email,
        workingHours: business.workingHours,
        cancellationPolicy: business.cancellationPolicy,
        location: business.location,
        description: business.description,
        about: business.about,
        yearsOfExperience: business.yearsOfExperience,
        specialties: business.specialties,
        slug: business.slug,
        avatar: business.avatar,
        coverImage: business.coverImage,
      });
  } catch (err) {
    next(err);
  }
};

export const getPublicBusinesses = async (req, res, next) => {
  try {
    const { search } = req.query;

    const query = {
      subscriptionStatus: "active",
      subscriptionExpiresAt: { $gt: new Date() },
    };

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const businesses = await Business.find(query)
      .select("name slug description location avatar")
      .sort({ createdAt: -1 });

    res.json(businesses);
  } catch (err) {
    next(err);
  }
};
