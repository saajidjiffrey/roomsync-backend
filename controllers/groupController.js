const groupService = require('../services/groupService');
const { validationResult } = require('express-validator');

class GroupController {
  // Create a new group
  async createGroup(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, description, group_image_url, property_id } = req.body;
      
      const groupData = {
        name,
        description,
        group_image_url,
        property_id
      };

      console.log('groupData', groupData);
      const group = await groupService.createGroup(groupData);
      
      res.status(201).json({
        success: true,
        message: 'Group created successfully',
        data: group
      });
    } catch (error) {
      console.error('Error creating group:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create group'
      });
    }
  }

  // Get all groups for a property
  async getGroupsByProperty(req, res) {
    try {
      const { propertyId } = req.params;
      
      const groups = await groupService.getGroupsByProperty(propertyId);
      
      res.status(200).json({
        success: true,
        data: groups
      });
    } catch (error) {
      console.error('Error getting groups:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get groups'
      });
    }
  }

  // Get a specific group by ID
  async getGroupById(req, res) {
    try {
      const { groupId } = req.params;
      
      const group = await groupService.getGroupById(groupId);
      
      res.status(200).json({
        success: true,
        data: group
      });
    } catch (error) {
      console.error('Error getting group:', error);
      if (error.message === 'Group not found') {
        return res.status(404).json({
          success: false,
          message: 'Group not found'
        });
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get group'
      });
    }
  }

  // Update a group
  async updateGroup(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { groupId } = req.params;
      const updateData = req.body;
      
      const group = await groupService.updateGroup(groupId, updateData);
      
      res.status(200).json({
        success: true,
        message: 'Group updated successfully',
        data: group
      });
    } catch (error) {
      console.error('Error updating group:', error);
      if (error.message === 'Group not found') {
        return res.status(404).json({
          success: false,
          message: 'Group not found'
        });
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update group'
      });
    }
  }

  // Delete a group
  async deleteGroup(req, res) {
    try {
      const { groupId } = req.params;
      
      const result = await groupService.deleteGroup(groupId);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error deleting group:', error);
      if (error.message === 'Group not found') {
        return res.status(404).json({
          success: false,
          message: 'Group not found'
        });
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete group'
      });
    }
  }

  // Add a tenant to a group
  async addTenantToGroup(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { groupId } = req.params;
      const { tenant_id } = req.body;
      
      const tenant = await groupService.addTenantToGroup(groupId, tenant_id);
      
      res.status(200).json({
        success: true,
        message: 'Tenant added to group successfully',
        data: tenant
      });
    } catch (error) {
      console.error('Error adding tenant to group:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to add tenant to group'
      });
    }
  }

  // Remove a tenant from a group
  async removeTenantFromGroup(req, res) {
    try {
      const { groupId, tenantId } = req.params;
      
      const tenant = await groupService.removeTenantFromGroup(groupId, tenantId);
      
      res.status(200).json({
        success: true,
        message: 'Tenant removed from group successfully',
        data: tenant
      });
    } catch (error) {
      console.error('Error removing tenant from group:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to remove tenant from group'
      });
    }
  }

  // Get tenants in a group
  async getGroupTenants(req, res) {
    try {
      const { groupId } = req.params;
      
      const tenants = await groupService.getGroupTenants(groupId);
      
      res.status(200).json({
        success: true,
        data: tenants
      });
    } catch (error) {
      console.error('Error getting group tenants:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get group tenants'
      });
    }
  }
}

const groupController = new GroupController();

// Bind all methods to preserve 'this' context
module.exports = {
  createGroup: groupController.createGroup.bind(groupController),
  getGroupsByProperty: groupController.getGroupsByProperty.bind(groupController),
  getGroupById: groupController.getGroupById.bind(groupController),
  updateGroup: groupController.updateGroup.bind(groupController),
  deleteGroup: groupController.deleteGroup.bind(groupController),
  addTenantToGroup: groupController.addTenantToGroup.bind(groupController),
  removeTenantFromGroup: groupController.removeTenantFromGroup.bind(groupController),
  getGroupTenants: groupController.getGroupTenants.bind(groupController)
};
