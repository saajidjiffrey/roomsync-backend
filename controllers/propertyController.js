const propertyService = require('../services/propertyService');
const propertyJoinRequestService = require('../services/propertyJoinRequestService');

class PropertyController {
  /**
   * Create a new property
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createProperty(req, res) {
    try {
      const { name, address, coordinates, description, space_available, property_image, tags } = req.body;
      const ownerId = req.user.id;

      const property = await propertyService.createProperty({
        name,
        address,
        coordinates,
        description,
        space_available,
        property_image,
        tags
      }, ownerId);

      res.status(201).json({
        success: true,
        message: 'Property created successfully',
        data: property
      });
    } catch (error) {
      console.error('Create property error:', error.message);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get all properties with optional filtering
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllProperties(req, res) {
    try {
      const filters = {};
      
      // Apply filters from query parameters
      if (req.query.owner_id) {
        filters.owner_id = parseInt(req.query.owner_id);
      }
      
      if (req.query.space_available !== undefined) {
        filters.space_available = parseInt(req.query.space_available);
      }

      const properties = await propertyService.getAllProperties(filters);

      res.status(200).json({
        success: true,
        data: properties
      });
    } catch (error) {
      console.error('Get all properties error:', error.message);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get property by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getPropertyById(req, res) {
    try {
      const propertyId = parseInt(req.params.id);
      
      if (isNaN(propertyId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid property ID'
        });
      }

      const property = await propertyService.getPropertyById(propertyId);

      res.status(200).json({
        success: true,
        data: property
      });
    } catch (error) {
      console.error('Get property error:', error.message);
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update property
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateProperty(req, res) {
    try {
      const propertyId = parseInt(req.params.id);
      const userId = req.user.id;
      
      if (isNaN(propertyId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid property ID'
        });
      }

      const { name, address, coordinates, description, space_available, property_image, tags } = req.body;

      const property = await propertyService.updateProperty(propertyId, {
        name,
        address,
        coordinates,
        description,
        space_available,
        property_image,
        tags
      }, userId);

      res.status(200).json({
        success: true,
        message: 'Property updated successfully',
        data: property
      });
    } catch (error) {
      console.error('Update property error:', error.message);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Delete property
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteProperty(req, res) {
    try {
      const propertyId = parseInt(req.params.id);
      const userId = req.user.id;
      
      if (isNaN(propertyId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid property ID'
        });
      }

      await propertyService.deleteProperty(propertyId, userId);

      res.status(200).json({
        success: true,
        message: 'Property deleted successfully'
      });
    } catch (error) {
      console.error('Delete property error:', error.message);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get properties by current user (owner)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getMyProperties(req, res) {
    try {
      const ownerId = req.user.id;

      const properties = await propertyService.getPropertiesByOwner(ownerId);

      res.status(200).json({
        success: true,
        data: properties
      });
    } catch (error) {
      console.error('Get my properties error:', error.message);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get properties near a location (tenant functionality)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getPropertiesNearLocation(req, res) {
    try {
      const { latitude, longitude, radius } = req.query;
      
      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required'
        });
      }

      const location = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      };

      const searchRadius = radius ? parseFloat(radius) : 10;

      const properties = await propertyService.getPropertiesNearLocation(location, searchRadius);

      res.status(200).json({
        success: true,
        data: properties
      });
    } catch (error) {
      console.error('Get properties near location error:', error.message);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Create a property join request (tenant functionality)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createJoinRequest(req, res) {
    try {
      const { property_ad_id, move_in_date } = req.body;
      const userId = req.user.id;

      const joinRequest = await propertyJoinRequestService.createJoinRequest({
        property_ad_id,
        move_in_date
      }, userId);

      res.status(201).json({
        success: true,
        message: 'Join request created successfully',
        data: joinRequest
      });
    } catch (error) {
      console.error('Create join request error:', error.message);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get join requests for a property ad (owner functionality)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getJoinRequestsForPropertyAd(req, res) {
    try {
      const propertyAdId = parseInt(req.params.propertyAdId);
      const userId = req.user.id;

      if (isNaN(propertyAdId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid property ad ID'
        });
      }

      const requests = await propertyJoinRequestService.getJoinRequestsForPropertyAd(propertyAdId, userId);

      res.status(200).json({
        success: true,
        data: requests
      });
    } catch (error) {
      console.error('Get join requests error:', error.message);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get join requests by current tenant
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getMyJoinRequests(req, res) {
    try {
      const userId = req.user.id;

      const requests = await propertyJoinRequestService.getJoinRequestsByTenant(userId);

      res.status(200).json({
        success: true,
        data: requests
      });
    } catch (error) {
      console.error('Get my join requests error:', error.message);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get join requests received by current owner
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getOwnerReceivedJoinRequests(req, res) {
    try {
      const userId = req.user.id;

      const requests = await propertyJoinRequestService.getJoinRequestsByOwner(userId);

      res.status(200).json({
        success: true,
        data: requests
      });
    } catch (error) {
      console.error('Get owner received join requests error:', error.message);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Respond to a join request (owner functionality)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async respondToJoinRequest(req, res) {
    try {
      const requestId = parseInt(req.params.requestId);
      const { status } = req.body;
      const userId = req.user.id;

      if (isNaN(requestId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request ID'
        });
      }

      const updatedRequest = await propertyJoinRequestService.respondToJoinRequest(
        requestId, 
        status, 
        userId
      );

      res.status(200).json({
        success: true,
        message: 'Join request updated successfully',
        data: updatedRequest
      });
    } catch (error) {
      console.error('Respond to join request error:', error.message);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Delete a join request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteJoinRequest(req, res) {
    try {
      const requestId = parseInt(req.params.requestId);
      const userId = req.user.id;

      if (isNaN(requestId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request ID'
        });
      }

      await propertyJoinRequestService.deleteJoinRequest(requestId, userId);

      res.status(200).json({
        success: true,
        message: 'Join request deleted successfully'
      });
    } catch (error) {
      console.error('Delete join request error:', error.message);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new PropertyController();
