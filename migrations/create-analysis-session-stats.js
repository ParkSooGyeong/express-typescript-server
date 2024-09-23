'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('analysis_session_stats', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      distance: {
        type: Sequelize.FLOAT(10, 2),
        allowNull: false
      },
      sprint: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      coverage: {
        type: Sequelize.FLOAT(10, 2),
        allowNull: false
      },
      speed_max: {
        type: Sequelize.FLOAT(10, 2),
        allowNull: false
      },
      speed_avg: {
        type: Sequelize.FLOAT(10, 2),
        allowNull: false
      },
      agility_ratio: {
        type: Sequelize.FLOAT(10, 2),
        allowNull: false
      },
      rate: {
        type: Sequelize.FLOAT(10, 2),
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('analysis_session_stats');
  }
};
