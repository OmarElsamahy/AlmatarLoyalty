const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const { tokenTypes } = require('../config/tokens');

class Token extends Model {}

Token.init(
  {
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id',
      },
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(tokenTypes)),
      allowNull: false,
    },
    expires: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    blacklisted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'Token',
    tableName: 'tokens',
    timestamps: true,
  }
);

module.exports = Token; // Ensure the model is exported
