const Group = require('../models/Group');
const Property = require('../models/Property');
const Tenant = require('../models/Tenant');
const User = require('../models/User');

class GroupService {
  // Create a new group
  async createGroup(groupData) {
    try {
      const group = await Group.create(groupData);
      return group;
    } catch (error) {
      throw new Error(`Failed to create group: ${error.message}`);
    }
  }

  // Get all groups for a property
  async getGroupsByProperty(propertyId) {
    try {
      const groups = await Group.findAll({
        where: { property_id: propertyId },
        include: [
          {
            model: Property,
            as: 'property',
            attributes: ['id', 'name', 'address']
          },
          {
            model: Tenant,
            as: 'tenants',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'full_name', 'email', 'phone_no']
              }
            ]
          }
        ]
      });
      return groups;
    } catch (error) {
      throw new Error(`Failed to get groups: ${error.message}`);
    }
  }

  // Get a specific group by ID
  async getGroupById(groupId) {
    try {
      const group = await Group.findByPk(groupId, {
        include: [
          {
            model: Property,
            as: 'property',
            attributes: ['id', 'name', 'address']
          },
          {
            model: Tenant,
            as: 'tenants',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'full_name', 'email', 'phone_no']
              }
            ]
          }
        ]
      });
      
      if (!group) {
        throw new Error('Group not found');
      }
      
      return group;
    } catch (error) {
      throw new Error(`Failed to get group: ${error.message}`);
    }
  }

  // Update a group
  async updateGroup(groupId, updateData) {
    try {
      const group = await Group.findByPk(groupId);
      if (!group) {
        throw new Error('Group not found');
      }
      
      await group.update(updateData);
      return group;
    } catch (error) {
      throw new Error(`Failed to update group: ${error.message}`);
    }
  }

  // Delete a group
  async deleteGroup(groupId) {
    try {
      const group = await Group.findByPk(groupId);
      if (!group) {
        throw new Error('Group not found');
      }
      
      await group.destroy();
      return { message: 'Group deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete group: ${error.message}`);
    }
  }

  // Add a tenant to a group
  async addTenantToGroup(groupId, tenantId) {
    try {
      const tenant = await Tenant.findByPk(tenantId);
      if (!tenant) {
        throw new Error('Tenant not found');
      }
      
      const group = await Group.findByPk(groupId);
      if (!group) {
        throw new Error('Group not found');
      }
      
      // Check if tenant is already in a group
      if (tenant.group_id) {
        throw new Error('Tenant is already in a group');
      }
      
      await tenant.update({ group_id: groupId });
      return tenant;
    } catch (error) {
      throw new Error(`Failed to add tenant to group: ${error.message}`);
    }
  }

  // Remove a tenant from a group
  async removeTenantFromGroup(groupId, tenantId) {
    try {
      const tenant = await Tenant.findOne({
        where: { id: tenantId, group_id: groupId }
      });
      
      if (!tenant) {
        throw new Error('Tenant not found in this group');
      }
      
      await tenant.update({ group_id: null });
      return tenant;
    } catch (error) {
      throw new Error(`Failed to remove tenant from group: ${error.message}`);
    }
  }

  // Get tenants in a group
  async getGroupTenants(groupId) {
    try {
      const tenants = await Tenant.findAll({
        where: { group_id: groupId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'full_name', 'email', 'phone_no']
          }
        ]
      });
      return tenants;
    } catch (error) {
      throw new Error(`Failed to get group tenants: ${error.message}`);
    }
  }
}

module.exports = new GroupService();

