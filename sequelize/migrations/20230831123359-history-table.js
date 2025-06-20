'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'history',
        {
          id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
          tableName: { type: Sequelize.STRING, allowNull: false },
          jsonData: { type: Sequelize.JSONB, allowNull: false },
          status: { type: Sequelize.STRING,allowNull:false, defaultValue: 'CREATE'},
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
          updatedAt: { type: Sequelize.DATE, allowNull: false},
        },
        { transaction: t }
      )
    })
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.dropTable('history', { transaction: t });
    });
  },
};

