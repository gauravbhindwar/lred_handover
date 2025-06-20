'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn('request_type', 'notificationEmails', {
          type: Sequelize.TEXT,
        }, { transaction: t }),
        queryInterface.changeColumn('client', 'approvalEmail', {
          type: Sequelize.TEXT,
        }, { transaction: t }),
        queryInterface.changeColumn('client', 'titreDeConge', {
          type: Sequelize.TEXT,
        }, { transaction: t }),
        queryInterface.changeColumn('client', 'medicalEmailSubmission', {
          type: Sequelize.TEXT,
        }, { transaction: t }),
        queryInterface.changeColumn('client', 'medicalEmailToday', {
          type: Sequelize.TEXT,
        }, { transaction: t }),
        queryInterface.changeColumn('client', 'medicalEmailMonthly', {
          type: Sequelize.TEXT,
        }, { transaction: t }),
      ])
    })
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn('request_type', 'notificationEmails', {
          type: Sequelize.STRING,
        }, { transaction: t }),
        queryInterface.changeColumn('client', 'approvalEmail', {
          type: Sequelize.STRING,
        }, { transaction: t }),
        queryInterface.changeColumn('client', 'titreDeConge', {
          type: Sequelize.STRING,
        }, { transaction: t }),
        queryInterface.changeColumn('client', 'medicalEmailSubmission', {
          type: Sequelize.STRING,
        }, { transaction: t }),
        queryInterface.changeColumn('client', 'medicalEmailToday', {
          type: Sequelize.STRING,
        }, { transaction: t }),
        queryInterface.changeColumn('client', 'medicalEmailMonthly', {
          type: Sequelize.STRING,
        }, { transaction: t }),
      ])
    })
  }
};
