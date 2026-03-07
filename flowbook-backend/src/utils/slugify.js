import slugifyLib from "slugify";

const slugify = (text) => {
  return slugifyLib(text, {
    lower: true,
    strict: true
  });
};

export default slugify;