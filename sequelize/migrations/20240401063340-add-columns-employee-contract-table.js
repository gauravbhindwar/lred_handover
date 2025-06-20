'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (t) => {
      return Promise.all([
        queryInterface.addColumn('employee_contract', 'workOrderDate', {
          type: Sequelize.DATE,
          allowNull:true
        }, { transaction: t }),
        queryInterface.addColumn('employee_contract', 'contractorsPassport',{
          type: Sequelize.STRING,
          allowNull:true
        },{ transaction: t }),
        queryInterface.addColumn('employee_contract', 'endOfAssignmentDate',{
          type: Sequelize.DATE,
          allowNull:true
        },{ transaction: t }),
        queryInterface.addColumn('employee_contract', 'descriptionOfAssignmentAndOrderConditions',{
          type: Sequelize.TEXT,
          allowNull:true
        },{ transaction: t }),
        queryInterface.addColumn('employee_contract', 'durationOfAssignment',{
          type: Sequelize.TEXT,
          allowNull:true
        },{ transaction: t }),
        queryInterface.addColumn('employee_contract', 'workLocation',{
          type: Sequelize.TEXT,
          allowNull:true
        },{ transaction: t }),
      ])
    })
  },

  async down (queryInterface) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('employee_contract', 'workOrderDate', { transaction: t }),
        queryInterface.removeColumn('employee_contract', 'contractorsPassport', { transaction: t }),
        queryInterface.removeColumn('employee_contract', 'endOfAssignmentDate', { transaction: t }),
        queryInterface.removeColumn('employee_contract', 'descriptionOfAssignmentAndOrderConditions', { transaction: t }),
        queryInterface.removeColumn('employee_contract', 'durationOfAssignment', { transaction: t }),
        queryInterface.removeColumn('employee_contract', 'workLocation', { transaction: t }),
      ])
    })
  }
};