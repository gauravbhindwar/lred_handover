'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        

        // employee file changes
        queryInterface.addColumn('employee_file', 'fileLink',
          {
            type: Sequelize.BOOLEAN,
            defaultValue:false,
            allowNull:true
          }, { transaction: t }),

          queryInterface.changeColumn('employee_file', 'name', {
            type: Sequelize.STRING,
            allowNull: true,
          }, { transaction: t }),

          queryInterface.changeColumn('employee_file', 'fileSize', {
            type: Sequelize.STRING,
            allowNull: true,
          }, { transaction: t }),
          queryInterface.changeColumn('employee_file', 'status', {
            type: Sequelize.INTEGER,
            allowNull: true,
          }, { transaction: t }),
// account changes
        queryInterface.addColumn('account', 'isGeneratedInvoice',
          {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
          }, { transaction: t }),

          queryInterface.addColumn('account', 'bonus1Name', {
            allowNull:true,
            type: Sequelize.STRING,
          }, { transaction: t }),
  
          queryInterface.addColumn('account', 'bonus2Name', {
            allowNull:true,
            type: Sequelize.STRING,
          }, { transaction: t }),
  
          queryInterface.addColumn('account', 'bonus3Name', {
            allowNull:true,
            type: Sequelize.STRING,
          }, { transaction: t }),
  
          queryInterface.addColumn('account', 'bonus3', {
            allowNull:true,
            type: Sequelize.FLOAT,
          }, { transaction: t }),
  
          queryInterface.addColumn('account', 'poBonus3', {
            allowNull:true,
            type: Sequelize.FLOAT,
          }, { transaction: t }),
  
          queryInterface.addColumn('account', 'invoiceNumberPOBonus3', {
            allowNull:true,
            type: Sequelize.STRING,
          }, { transaction: t }),
  
          queryInterface.addColumn('account', 'additionalAmount', {
            allowNull:true,
            type: Sequelize.FLOAT,
          }, { transaction: t }),
  
          queryInterface.addColumn('account', 'additionalPOBonus', {
            allowNull:true,
            type: Sequelize.STRING,
          }, { transaction: t }),
  
          queryInterface.addColumn('account', 'additionalInvoiceNumberPO', {
            allowNull:true,
            type: Sequelize.STRING,
          }, { transaction: t }),
      ])
    })
  },

  async down (queryInterface) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([

        // employee file changes
        queryInterface.removeColumn('employee_file', 'fileLink', { transaction: t }),
        queryInterface.changeColumn('employee_file', 'name', {
          type: Sequelize.STRING,
          allowNull: false,
        }, { transaction: t }),
        queryInterface.changeColumn('employee_file', 'fileSize', {
          type: Sequelize.STRING,
          allowNull: false,
        }, { transaction: t }),
        queryInterface.changeColumn('employee_file', 'status', {
          type: Sequelize.INTEGER,
          allowNull: false,
        }, { transaction: t }),
        // account changes
        queryInterface.removeColumn('account', 'isGeneratedInvoice', { transaction: t }),
        queryInterface.removeColumn('account', 'bonus1Name', {
          allowNull:true,
          type: Sequelize.STRING,
        }, { transaction: t }),

        queryInterface.removeColumn('account', 'bonus2Name', {
          allowNull:true,
          type: Sequelize.STRING,
        }, { transaction: t }),

        queryInterface.removeColumn('account', 'bonus3Name', {
          allowNull:true,
          type: Sequelize.STRING,
        }, { transaction: t }),

        queryInterface.removeColumn('account', 'bonus3', {
          allowNull:true,
          type: Sequelize.FLOAT,
        }, { transaction: t }),

        queryInterface.removeColumn('account', 'poBonus3', {
          allowNull:true,
          type: Sequelize.FLOAT,
        }, { transaction: t }),

        queryInterface.removeColumn('account', 'invoiceNumberPOBonus3', {
          allowNull:true,
          type: Sequelize.STRING,
        }, { transaction: t }),

        queryInterface.removeColumn('account', 'additionalAmount', {
          allowNull:true,
          type: Sequelize.FLOAT,
        }, { transaction: t }),

        queryInterface.removeColumn('account', 'additionalPOBonus', {
          allowNull:true,
          type: Sequelize.STRING,
        }, { transaction: t }),
        
        queryInterface.removeColumn('account', 'additionalInvoiceNumberPO', {
          allowNull:true,
          type: Sequelize.STRING,
        }, { transaction: t }),
      ])
    })
  }
};
