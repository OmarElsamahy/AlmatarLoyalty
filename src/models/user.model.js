const { DataTypes, Model, Op } = require('sequelize');
const sequelize = require('../config/database'); // Your Sequelize instance setup
const validator = require('validator');
const bcrypt = require('bcryptjs');
const toJSON = require('./plugins/toJSON.plugin');
const paginate = require('./plugins/paginate.plugin');
const Token = require('./token.model');
const Transfer = require('./transfer.model');
class User extends Model {
  // Static method to check if email is taken
  static async isEmailTaken(email, excludeUserId) {
    const user = await this.findOne({
      where: { email, id: { [Op.ne]: excludeUserId } },
    });
    return !!user;
  }

  // Method to check if a given password matches the stored hash
  async isPasswordMatch(password) {
    return bcrypt.compare(password, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      index: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
      validate: {
        isEmail(value) {
          if (!validator.isEmail(value)) {
            throw new Error('Invalid email');
          }
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true,
      validate: {
        isLongEnough(value) {
          if (value.length < 8) {
            throw new Error('Password must be at least 8 characters long');
          }
          if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
            throw new Error('Password must contain at least one letter and one number');
          }
        },
      },
    },
    // New attribute for loyalty points with a default value of 500
    loyaltyPoints: {
      type: DataTypes.INTEGER,
      defaultValue: 500,
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    indexes: [
      {
        fields: ['email', 'isEmailVerified'], // Composite index on email and isEmailVerified
      },
    ],
  }
);

// Hash password before creating or updating a user
User.beforeCreate(async (user) => {
  if (user.password) {
    user.password = await bcrypt.hash(user.password, 8);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
});

// Associations
User.hasMany(Token, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(Transfer, { foreignKey: 'senderId' });
User.hasMany(Transfer, { foreignKey: 'receiverId' });


// Prototypes
User.prototype.toJSON = toJSON(['password', 'createdAt', 'updatedAt']);

// Paginate
paginate(User);


module.exports = User;
