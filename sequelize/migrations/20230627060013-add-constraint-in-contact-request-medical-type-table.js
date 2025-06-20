'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    return queryInterface.sequelize.transaction((t)=>{
      return Promise.all([
        queryInterface.addConstraint('contact',{
          type: 'foreign key',
          name: 'contact_client_id_fk',
          fields: ['clientId'],
          references:{
            table:'client',
            field: 'id'
          },
          transaction: t,
        }),
        queryInterface.addConstraint('contact',{
          type: 'foreign key',
          name: 'contact_created_by_fk',
          fields: ['createdBy'],
          references:{
            table:'users',
            field: 'id'
          },
          transaction: t,
        }),
        queryInterface.addConstraint('contact',{
          type: 'foreign key',
          name: 'contact_updated_by_fk',
          fields: ['updatedBy'],
          references:{
            table:'users',
            field: 'id'
          },
          transaction: t,
        }),
        queryInterface.addConstraint('request_type',{
          type: 'foreign key',
          name: 'request_type_created_by_fk',
          fields: ['createdBy'],
          references:{
            table:'users',
            field: 'id'
          },
          transaction: t,
        }),
        queryInterface.addConstraint('request_type',{
          type: 'foreign key',
          name: 'request_type_updated_by_fk',
          fields: ['updatedBy'],
          references:{
            table:'users',
            field: 'id'
          },
          transaction: t,
        }),
        queryInterface.addConstraint('medical_type',{
          type: 'foreign key',
          name: 'medical_type_created_by_fk',
          fields: ['createdBy'],
          references:{
            table:'users',
            field: 'id'
          },
          transaction: t,
        }),
        queryInterface.addConstraint('medical_type',{
          type: 'foreign key',
          name: 'medical_type_updated_by_fk',
          fields: ['updatedBy'],
          references:{
            table:'users',
            field: 'id'
          },
          transaction: t,
        })
      ])
    })
  },

  async down (queryInterface) {
    return queryInterface.sequelize.transaction((t)=>{
      return Promise.all([
        queryInterface.removeConstraint('contact','contact_client_id_fk',{transaction:t}),
        queryInterface.removeConstraint('contact','contact_created_by_fk',{transaction:t}),
        queryInterface.removeConstraint('contact','contact_updated_by_fk',{transaction:t}),
        queryInterface.removeConstraint('request_type','request_type_created_by_fk',{transaction:t}),
        queryInterface.removeConstraint('request_type','request_type_updated_by_fk',{transaction:t}),
        queryInterface.removeConstraint('medical_type','medical_type_created_by_fk',{transaction:t}),
        queryInterface.removeConstraint('medical_type','medical_type_updated_by_fk',{transaction:t}),
      ])
    })
  }
};
