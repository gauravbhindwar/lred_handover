'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'employee',
        {
          id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
          employeeNumber: {type: Sequelize.STRING, allowNull: true},
          TempNumber: {type: Sequelize.STRING, allowNull: true},
          contractNumber: {type: Sequelize.STRING, allowNull: true},
          contractSignedDate: {type: Sequelize.DATE, allowNull: true},
          startDate: {type: Sequelize.DATE, allowNull: true},
          firstName: {type: Sequelize.STRING, allowNull: false},
          lastName: {type: Sequelize.STRING, allowNull: false},
          fonction: {type: Sequelize.STRING, allowNull: true},
          dOB: {type: Sequelize.DATE, allowNull: true},
          placeOfBirth: {type: Sequelize.STRING, allowNull: true},
          nSS: {type: Sequelize.STRING, allowNull: true},
          gender: {type: Sequelize.STRING, allowNull: false},
          terminationDate: {type: Sequelize.DATE, allowNull: true},
          baseSalary: {type: Sequelize.FLOAT, allowNull: true},
          travelAllowance: {type: Sequelize.FLOAT, allowNull: true},
          Housing: {type: Sequelize.FLOAT, allowNull: true},
          monthlySalary: {type: Sequelize.FLOAT, allowNull: true},
          address: {type: Sequelize.STRING, allowNull: true},
          medicalCheckDate: {type: Sequelize.DATE, allowNull: true},
          medicalCheckExpiry: {type: Sequelize.DATE, allowNull: true},
          medicalInsurance: {type: Sequelize.BOOLEAN, allowNull: true},
          contractEndDate: {type: Sequelize.DATE, allowNull: true},
          dailyCost: {type: Sequelize.FLOAT, allowNull: true},
          mobileNumber: {type: Sequelize.STRING, allowNull: true},
          nextOfKinMobile: {type: Sequelize.STRING, allowNull: true},
          initialBalance: {type: Sequelize.FLOAT, allowNull: true},
          photoVersionNumber: {type: Sequelize.INTEGER, allowNull: true},
          email: {type: Sequelize.STRING, allowNull: true},
          clientId: { type: Sequelize.INTEGER, allowNull: true },
          segmentId: { type: Sequelize.INTEGER, allowNull: true },
          subSegmentId: { type: Sequelize.INTEGER, allowNull: true },
          rotationId: { type: Sequelize.INTEGER, allowNull: true },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
          createdBy: { type: Sequelize.INTEGER },
          updatedAt: { type: Sequelize.DATE, allowNull: false },
          updatedBy: { type: Sequelize.INTEGER },
          deletedAt: { type: Sequelize.DATE },
        },
        { transaction: t },
      );
      await queryInterface.addConstraint('employee', {
        type: 'foreign key',
        name: 'employee_client_id_fk',
        fields: ['clientId'],
        references: {
          table: 'client',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('employee', {
        type: 'foreign key',
        name: 'employee_segment_id_fk',
        fields: ['segmentId'],
        references: {
          table: 'segment',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('employee', {
        type: 'foreign key',
        name: 'employee_sub_segment_id_fk',
        fields: ['subSegmentId'],
        references: {
          table: 'sub_segment',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('employee', {
        type: 'foreign key',
        name: 'employee_rotation_id_fk',
        fields: ['rotationId'],
        references: {
          table: 'rotation',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('employee', {
        type: 'foreign key',
        name: 'employee_created_by_fk',
        fields: ['createdBy'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('employee', {
        type: 'foreign key',
        name: 'employee_updated_by_fk',
        fields: ['updatedBy'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction: t,
      });
    });
  },

  async down (queryInterface) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.dropTable('employee', { transaction: t });
    });
  }
};
