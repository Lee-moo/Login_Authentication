const Sequelize = require('sequelize');

//provider : 1 - 홈페이지 가입자, 2 - kakao OAUTH 3 - naver OAUTH

module.exports = class tUser extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        user_id: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        password: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        provider: {
          type: Sequelize.STRING(1),
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING(10),
          allowNull: true,
        },
        birthday: {
          type: Sequelize.STRING(12),
          allowNull: true,
        },
        gender: {
          type: Sequelize.STRING(1),
          allowNull: true,
        },
      },
      {
        sequelize,
        timestamps: true,
        paranoid: true,
        deletedAt: 'destroyTime',
        modelName: 'tUser',
        tableName: 'tUser',
        underscored: false,
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
      }
    );
  }
};
