const Expense = require('../models/Expense');
const Group = require('../models/Group');
const Tenant = require('../models/Tenant');
const User = require('../models/User');
const Split = require('../models/Split');
const sequelize = require('../configs/database');

class ExpenseService {
  // Create a new expense with automatic split creation
  async createExpense(expenseData) {
    const transaction = await sequelize.transaction();
    
    try {
      console.log('Creating expense with data:', expenseData);
      
      // Extract selected roommates and remove from expenseData
      const { selected_roommates, ...expenseInfo } = expenseData;
      
      console.log('Expense info:', expenseInfo);
      console.log('Selected roommates:', selected_roommates);
      
      // Create the expense
      const expense = await Expense.create(expenseInfo, { transaction });
      console.log('Created expense:', expense);
      
      // Calculate split amount per person
      const splitAmount = expense.receipt_total / selected_roommates.length;
      console.log('Split amount per person:', splitAmount);
      
      // Create splits for each selected roommate
      const splitsData = selected_roommates.map(tenantId => ({
        expense_id: expense.id,
        split_amount: splitAmount,
        assigned_to: tenantId,
        assigned_by: expense.created_by, // The person who created the expense
        status: tenantId === expense.created_by ? 'paid' : 'unpaid', // Creator's split is automatically paid
        paid_date: tenantId === expense.created_by ? new Date() : null
      }));
      
      console.log('Splits data to create:', splitsData);
      
      // Create all splits
      const createdSplits = await Split.bulkCreate(splitsData, { transaction });
      console.log('Created splits:', createdSplits);
      
      // Commit the transaction
      await transaction.commit();
      
      // Return the expense with splits
      return await this.getExpenseById(expense.id);
    } catch (error) {
      // Rollback the transaction on error
      await transaction.rollback();
      throw new Error(`Failed to create expense: ${error.message}`);
    }
  }

  // Get all expenses for a group
  async getExpensesByGroup(groupId) {
    try {
      const expenses = await Expense.findAll({
        where: { group_id: groupId },
        attributes: ['id', 'title', 'description', 'receipt_total', 'category', 'group_id', 'created_by', 'created_at', 'updated_at'],
        include: [
          {
            model: Group,
            as: 'group',
            attributes: ['id', 'name']
          },
          {
            model: Tenant,
            as: 'creator',
            include: [
              {
                model: User,
                as: 'tenantUser',
                attributes: ['id', 'full_name', 'email', 'phone_no']
              }
            ]
          },
          {
            model: Split,
            as: 'splits',
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
          }
        ],
        order: [['created_at', 'DESC']]
      });
      
      return expenses;
    } catch (error) {
      throw new Error(`Failed to get expenses: ${error.message}`);
    }
  }

  // Get a specific expense by ID
  async getExpenseById(expenseId) {
    try {
      const expense = await Expense.findByPk(expenseId, {
        include: [
          {
            model: Group,
            as: 'group',
            attributes: ['id', 'name']
          },
          {
            model: Tenant,
            as: 'creator',
            include: [
              {
                model: User,
                as: 'tenantUser',
                attributes: ['id', 'full_name', 'email', 'phone_no']
              }
            ]
          },
          {
            model: Split,
            as: 'splits',
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
          }
        ]
      });
      
      if (!expense) {
        throw new Error('Expense not found');
      }
      
      return expense;
    } catch (error) {
      throw new Error(`Failed to get expense: ${error.message}`);
    }
  }

  // Update an expense
  async updateExpense(expenseId, updateData) {
    try {
      const expense = await Expense.findByPk(expenseId);
      if (!expense) {
        throw new Error('Expense not found');
      }
      
      await expense.update(updateData);
      return expense;
    } catch (error) {
      throw new Error(`Failed to update expense: ${error.message}`);
    }
  }

  // Delete an expense
  async deleteExpense(expenseId) {
    try {
      const expense = await Expense.findByPk(expenseId);
      if (!expense) {
        throw new Error('Expense not found');
      }
      
      await expense.destroy();
      return { message: 'Expense deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete expense: ${error.message}`);
    }
  }

  // Get expenses by category
  async getExpensesByCategory(groupId, category) {
    try {
      const expenses = await Expense.findAll({
        where: { 
          group_id: groupId,
          category: category
        },
        include: [
          {
            model: Group,
            as: 'group',
            attributes: ['id', 'name']
          },
          {
            model: Tenant,
            as: 'creator',
            include: [
              {
                model: User,
                as: 'tenantUser',
                attributes: ['id', 'full_name', 'email', 'phone_no']
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']]
      });
      return expenses;
    } catch (error) {
      throw new Error(`Failed to get expenses by category: ${error.message}`);
    }
  }

  // Get total expenses for a group
  async getTotalExpensesByGroup(groupId) {
    try {
      const result = await Expense.findOne({
        where: { group_id: groupId },
        attributes: [
          [sequelize.fn('SUM', sequelize.col('receipt_total')), 'total']
        ]
      });
      
      return result ? parseFloat(result.dataValues.total) || 0 : 0;
    } catch (error) {
      throw new Error(`Failed to get total expenses: ${error.message}`);
    }
  }
}

module.exports = new ExpenseService();
