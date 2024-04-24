const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database'); // Your Sequelize instance setup
const validator = require('validator');
const bcrypt = require('bcryptjs');

class User extends Model {
  static async isEmailTaken(email, excludeUserId) {
    const user = await this.findOne({
      where: { email, id: { [sequelize.Op.ne]: excludeUserId } },
    });
    return !!user;
  }

  async isPasswordMatch(password) {
    return bcrypt.compare(password, this.password);
  }
}

User.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
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
  }
);


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


module.exports = User;
