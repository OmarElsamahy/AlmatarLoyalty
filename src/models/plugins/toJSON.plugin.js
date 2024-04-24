/**
 * A utility function to transform Sequelize model JSON output:
 * - Removes fields like `__v`, `createdAt`, `updatedAt`, and others as needed
 * - Applies a custom transformation function if provided
 *
 * @param {Array<string>} excludeFields - List of fields to remove
 * @param {Function} customTransform - Optional custom transformation function
 * @returns {Object} - The transformed JSON object
 */
const toJSON = (excludeFields = [], customTransform = null) => {
  return function () {
    // Convert the model instance to a plain JavaScript object
    let result = this.get({ plain: true });

    // Remove specific fields
    excludeFields.forEach((field) => {
      delete result[field];
    });

    // Apply custom transformation, if provided
    if (customTransform) {
      result = customTransform(result);
    }

    return result;
  };
};

module.exports = toJSON;
