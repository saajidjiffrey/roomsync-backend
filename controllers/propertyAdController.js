const propertyAdService = require('../services/propertyAdService');

class PropertyAdController {
  /**
   * Create a new property ad
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createPropertyAd(req, res) {
    try {
      const { property_id, number_of_spaces_looking_for, is_active } = req.body;
      const userId = req.user.id;

      const propertyAd = await propertyAdService.createPropertyAd({
        property_id,
        number_of_spaces_looking_for,
        is_active
      }, userId);

      res.status(201).json({
        success: true,
        message: 'Property ad created successfully',
        data: propertyAd
      });
    } catch (error) {
      console.error('Create property ad error:', error.message);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get all property ads with optional filtering
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllPropertyAds(req, res) {
    try {
      const filters = {};
      
      // Apply filters from query parameters
      if (req.query.is_active !== undefined) {
        filters.is_active = req.query.is_active === 'true';
      }

      const propertyAds = await propertyAdService.getAllPropertyAds(filters);

      res.status(200).json({
        success: true,
        data: propertyAds
      });
    } catch (error) {
      console.error('Get all property ads error:', error.message);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get property ad by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getPropertyAdById(req, res) {
    try {
      const adId = parseInt(req.params.id);
      
      if (isNaN(adId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid property ad ID'
        });
      }

      const propertyAd = await propertyAdService.getPropertyAdById(adId);

      res.status(200).json({
        success: true,
        data: propertyAd
      });
    } catch (error) {
      console.error('Get property ad error:', error.message);
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update property ad
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updatePropertyAd(req, res) {
    try {
      const adId = parseInt(req.params.id);
      const userId = req.user.id;
      
      if (isNaN(adId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid property ad ID'
        });
      }

      const { property_id, number_of_spaces_looking_for, is_active } = req.body;

      const propertyAd = await propertyAdService.updatePropertyAd(adId, {
        property_id,
        number_of_spaces_looking_for,
        is_active
      }, userId);

      res.status(200).json({
        success: true,
        message: 'Property ad updated successfully',
        data: propertyAd
      });
    } catch (error) {
      console.error('Update property ad error:', error.message);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Delete property ad
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deletePropertyAd(req, res) {
    try {
      const adId = parseInt(req.params.id);
      const userId = req.user.id;
      
      if (isNaN(adId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid property ad ID'
        });
      }

      await propertyAdService.deletePropertyAd(adId, userId);

      res.status(200).json({
        success: true,
        message: 'Property ad deleted successfully'
      });
    } catch (error) {
      console.error('Delete property ad error:', error.message);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get property ads by current user (owner)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getMyPropertyAds(req, res) {
    try {
      const userId = req.user.id;

      const propertyAds = await propertyAdService.getPropertyAdsByOwner(userId);

      res.status(200).json({
        success: true,
        data: propertyAds
      });
    } catch (error) {
      console.error('Get my property ads error:', error.message);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get property ads near a location (tenant functionality)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getPropertyAdsNearLocation(req, res) {
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

      const propertyAds = await propertyAdService.getPropertyAdsNearLocation(location, searchRadius);

      res.status(200).json({
        success: true,
        data: propertyAds
      });
    } catch (error) {
      console.error('Get property ads near location error:', error.message);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new PropertyAdController();
