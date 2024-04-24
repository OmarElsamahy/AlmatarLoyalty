const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database'); // Assume this is your Sequelize instance setup
const { tokenTypes } = require('../config/tokens');

class Token extends Model {}

Token.init(
  {
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // This prevents duplicate tokens
    },
    userId: {
      type: DataTypes.INTEGER, // The data type for references to other models
      references: {
        model: 'Users',
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
    tableName: 'tokens', // Name of the table in the database
    timestamps: true, // This will automatically create 'createdAt' and 'updatedAt'
  }
);
