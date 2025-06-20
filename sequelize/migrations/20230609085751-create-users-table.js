'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'users',
        {
          id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
          email: { type: Sequelize.STRING, allowNull: false },
          username: { type: Sequelize.STRING },
          firstName: { type: Sequelize.STRING },
          lastName: { type: Sequelize.STRING },
          password: { type: Sequelize.TEXT },
          addedBy: { type: Sequelize.INTEGER },
          birthDate: { type: Sequelize.DATE },
          gender: { type: Sequelize.STRING },
          code: { type: Sequelize.STRING },
          phone: { type: Sequelize.STRING },
          profileImage: { type: Sequelize.STRING },
          verified: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
          status: { type: Sequelize.ENUM('ACTIVE', 'INACTIVE'), allowNull: false, defaultValue: 'ACTIVE' },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
          updatedAt: { type: Sequelize.DATE, allowNull: false },
          deletedAt: { type: Sequelize.DATE },
        },
        { transaction: t },
      );
      await queryInterface.addIndex('users', {
        name: 'unique_email_uk',
        fields: ['email'],
        unique: true,
        where: {
          deletedAt: null,
        },
        transaction: t,
      });
      await queryInterface.addConstraint('users', {
        type: 'foreign key',
        name: 'users_added_by_fk',
        fields: ['addedBy'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction: t,
      });
      // await queryInterface.sequelize.query(`SELECT create_reference_table('users')`, { transaction: t });
    });
  },

  async down (queryInterface) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.dropTable('users', { transaction: t });
    });
  }
};
