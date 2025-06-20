'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn('requests', 'contractNumber', {
          type: Sequelize.STRING,
          allowNull: true,
        }, { transaction: t }),
        queryInterface.changeColumn('requests', 'mobileNumber', {
          type: Sequelize.STRING,
          allowNull: true,
        }, { transaction: t }),
        queryInterface.changeColumn('requests', 'deliveryDate', {
          type: Sequelize.DATE,
          allowNull: true,
        }, { transaction: t }),
        queryInterface.changeColumn('request_document', 'otherInfo', {
          type: Sequelize.TEXT,
          allowNull: false,
        }, { transaction: t }),
      ])
    })
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
       return Promise.all([
      queryInterface.changeColumn('requests', 'contractNumber', {
        type: Sequelize.INTEGER,
        allowNull: false,
      }, { transaction: t }),
      queryInterface.changeColumn('requests', 'mobileNumber', {
        type: Sequelize.INTEGER,
        allowNull: false,
      }, { transaction: t }),
      queryInterface.changeColumn('requests', 'deliveryDate', {
        type: Sequelize.DATE,
        allowNull: false,
      }, { transaction: t }),
      queryInterface.changeColumn('request_document', 'otherInfo', {
        type: Sequelize.STRING,
        allowNull: false,
      }, { transaction: t }),
    ])
    });
   
  }
};
