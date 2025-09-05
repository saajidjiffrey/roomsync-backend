const Split = require('../models/Split');
const Expense = require('../models/Expense');
const Tenant = require('../models/Tenant');
const User = require('../models/User');
const Group = require('../models/Group');
const sequelize = require('../configs/database');
const { Op } = require('sequelize');

class SplitService {
  // Create a new split
  async createSplit(splitData) {
    try {
      const split = await Split.create(splitData);
      return split;
    } catch (error) {
      throw new Error(`Failed to create split: ${error.message}`);
    }
  }

  // Create multiple splits for an expense
  async createSplitsForExpense(expenseId, splitsData) {
    try {
      const splits = await Split.bulkCreate(splitsData.map(split => ({
        ...split,
        expense_id: expenseId
      })));
      return splits;
    } catch (error) {
      throw new Error(`Failed to create splits: ${error.message}`);
    }
  }

  // Get all splits for an expense
  async getSplitsByExpense(expenseId) {
    try {
      const splits = await Split.findAll({
        where: { expense_id: expenseId },
        include: [
          {
            model: Expense,
            as: 'expense',
            attributes: ['id', 'title', 'receipt_total']
          },
          {
            model: Tenant,
            as: 'assignedTenant',
            include: [
              {
                model: User,
                as: 'tenantUser',
                attributes: ['id', 'full_name', 'email', 'phone_no']
              }
            ]
          }
        ],
        order: [['created_at', 'ASC']]
      });
      return splits;
    } catch (error) {
      throw new Error(`Failed to get splits: ${error.message}`);
    }
  }

  // Get splits by tenant
  async getSplitsByTenant(tenantId) {
    try {
      const splits = await Split.findAll({
        where: { assigned_to: tenantId },
        include: [
          {
            model: Expense,
            as: 'expense',
            include: [
              {
                model: Group,
                as: 'group',
                attributes: ['id', 'name']
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']]
      });
      return splits;
    } catch (error) {
      throw new Error(`Failed to get tenant splits: ${error.message}`);
    }
  }

  // Get a specific split by ID
  async getSplitById(splitId) {
    try {
      const split = await Split.findByPk(splitId, {
        include: [
          {
            model: Expense,
            as: 'expense',
            attributes: ['id', 'title', 'receipt_total']
          },
          {
            model: Tenant,
            as: 'assignedTenant',
            include: [
              {
                model: User,
                as: 'tenantUser',
                attributes: ['id', 'full_name', 'email', 'phone_no']
              }
            ]
          }
        ]
      });
      
      if (!split) {
        throw new Error('Split not found');
      }
      
      return split;
    } catch (error) {
      throw new Error(`Failed to get split: ${error.message}`);
    }
  }

  // Update a split
  async updateSplit(splitId, updateData) {
    try {
      const split = await Split.findByPk(splitId);
      if (!split) {
        throw new Error('Split not found');
      }
      
      await split.update(updateData);
      return split;
    } catch (error) {
      throw new Error(`Failed to update split: ${error.message}`);
    }
  }

  // Update split status
  async updateSplitStatus(splitId, status, paidDate = null) {
    try {
      const split = await Split.findByPk(splitId);
      if (!split) {
        throw new Error('Split not found');
      }
      
      const updateData = { status };
      if (status === 'paid' && paidDate) {
        updateData.paid_date = paidDate;
      } else if (status !== 'paid') {
        updateData.paid_date = null;
      }
      
      await split.update(updateData);
      return split;
    } catch (error) {
      throw new Error(`Failed to update split status: ${error.message}`);
    }
  }

  // Delete a split
  async deleteSplit(splitId) {
    try {
      const split = await Split.findByPk(splitId);
      if (!split) {
        throw new Error('Split not found');
      }
      
      await split.destroy();
      return { message: 'Split deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete split: ${error.message}`);
    }
  }

  // Get splits by status
  async getSplitsByStatus(expenseId, status) {
    try {
      const splits = await Split.findAll({
        where: { 
          expense_id: expenseId,
          status: status
        },
        include: [
          {
            model: Tenant,
            as: 'assignedTenant',
            include: [
              {
                model: User,
                as: 'tenantUser',
                attributes: ['id', 'full_name', 'email', 'phone_no']
              }
            ]
          }
        ]
      });
      return splits;
    } catch (error) {
      throw new Error(`Failed to get splits by status: ${error.message}`);
    }
  }

  // Get total amount for splits by status
  async getTotalSplitsByStatus(expenseId, status) {
    try {
      const result = await Split.findOne({
        where: { 
          expense_id: expenseId,
          status: status
        },
        attributes: [
          [sequelize.fn('SUM', sequelize.col('split_amount')), 'total']
        ]
      });
      
      return result ? parseFloat(result.dataValues.total) || 0 : 0;
    } catch (error) {
      throw new Error(`Failed to get total splits by status: ${error.message}`);
    }
  }

  // Get splits that the current user needs to pay
  async getToPaySplits(userId) {
    try {
      // First get the tenant record for this user
      const tenant = await Tenant.findOne({
        where: { user_id: userId }
      });

      if (!tenant) {
        throw new Error('Tenant record not found');
      }

      const splits = await Split.findAll({
        where: { 
          assigned_to: tenant.id,
          status: ['unpaid', 'pending']
        },
        include: [
          {
            model: Expense,
            as: 'expense',
            attributes: ['id', 'title', 'description', 'receipt_total', 'category', 'created_by', 'group_id']
          },
          {
            model: Tenant,
            as: 'assignedTenant',
            include: [
              {
                model: User,
                as: 'tenantUser',
                attributes: ['id', 'full_name', 'email', 'phone_no']
              }
            ]
          },
          {
            model: Tenant,
            as: 'assignedByTenant',
            include: [
              {
                model: User,
                as: 'tenantUser',
                attributes: ['id', 'full_name', 'email', 'phone_no']
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']        ]
      });

      return splits;
    } catch (error) {
      throw new Error(`Failed to get to pay splits: ${error.message}`);
    }
  }

  // Get splits that the current user should receive
  async getToReceiveSplits(userId) {
    try {
      console.log('getToReceiveSplits called with userId:', userId);
      
      // First get the tenant record for this user
      const tenant = await Tenant.findOne({
        where: { user_id: userId }
      });

      console.log('Found tenant for toReceive:', tenant);

      if (!tenant) {
        throw new Error('Tenant record not found');
      }

      const splits = await Split.findAll({
        where: { 
          assigned_by: tenant.id,
          status: ['unpaid', 'pending']
        },
        include: [
          {
            model: Expense,
            as: 'expense',
            attributes: ['id', 'title', 'description', 'receipt_total', 'category', 'created_by', 'group_id']
          },
          {
            model: Tenant,
            as: 'assignedTenant',
            include: [
              {
                model: User,
                as: 'tenantUser',
                attributes: ['id', 'full_name', 'email', 'phone_no']
              }
            ]
          },
          {
            model: Tenant,
            as: 'assignedByTenant',
            include: [
              {
                model: User,
                as: 'tenantUser',
                attributes: ['id', 'full_name', 'email', 'phone_no']
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']        ]
      });

      return splits;
    } catch (error) {
      throw new Error(`Failed to get to receive splits: ${error.message}`);
    }
  }

  // Get split history for the current user
  async getSplitHistory(userId) {
    try {
      // First get the tenant record for this user
      const tenant = await Tenant.findOne({
        where: { user_id: userId }
      });

      if (!tenant) {
        throw new Error('Tenant record not found');
      }

      const splits = await Split.findAll({
        where: { 
          status: 'paid',
          [Op.or]: [
            { assigned_to: tenant.id },
            { assigned_by: tenant.id }
          ]
        },
        include: [
          {
            model: Expense,
            as: 'expense',
            attributes: ['id', 'title', 'description', 'receipt_total', 'category', 'created_by', 'group_id']
          },
          {
            model: Tenant,
            as: 'assignedTenant',
            include: [
              {
                model: User,
                as: 'tenantUser',
                attributes: ['id', 'full_name', 'email', 'phone_no']
              }
            ]
          },
          {
            model: Tenant,
            as: 'assignedByTenant',
            include: [
              {
                model: User,
                as: 'tenantUser',
                attributes: ['id', 'full_name', 'email', 'phone_no']
              }
            ]
          }
        ],
        order: [['paid_date', 'DESC']]
      });

      return splits;
    } catch (error) {
      throw new Error(`Failed to get split history: ${error.message}`);
    }
  }

  // Get split summary for the current user
  async getSplitSummary(userId) {
    try {
      // First get the tenant record for this user
      const tenant = await Tenant.findOne({
        where: { user_id: userId }
      });

      if (!tenant) {
        throw new Error('Tenant record not found');
      }

      // Get to pay total
      const toPayResult = await Split.findAll({
        where: { 
          assigned_to: tenant.id,
          status: ['unpaid', 'pending']
        },
        attributes: [
          [sequelize.fn('SUM', sequelize.col('split_amount')), 'total'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        raw: true
      });

      // Get to receive total
      const toReceiveResult = await Split.findAll({
        where: { 
          assigned_by: tenant.id,
          status: ['unpaid', 'pending']
        },
        attributes: [
          [sequelize.fn('SUM', sequelize.col('split_amount')), 'total'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        raw: true
      });

      // Get history totals
      const historyResult = await Split.findAll({
        where: { 
          status: 'paid',
          [Op.or]: [
            { assigned_to: tenant.id },
            { assigned_by: tenant.id }
          ]
        },
        attributes: [
          [sequelize.fn('SUM', sequelize.col('split_amount')), 'total'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        raw: true
      });

      const summary = {
        toPay: {
          total: parseFloat(toPayResult[0]?.total || 0),
          count: parseInt(toPayResult[0]?.count || 0)
        },
        toReceive: {
          total: parseFloat(toReceiveResult[0]?.total || 0),
          count: parseInt(toReceiveResult[0]?.count || 0)
        },
        history: {
          total: parseFloat(historyResult[0]?.total || 0),
          count: parseInt(historyResult[0]?.count || 0)
        }
      };

      return summary;
    } catch (error) {
      throw new Error(`Failed to get split summary: ${error.message}`);
    }
  }
}

module.exports = new SplitService();
