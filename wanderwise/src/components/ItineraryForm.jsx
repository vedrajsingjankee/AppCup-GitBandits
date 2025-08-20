import React, { useState } from 'react';

const ItineraryForm = ({ onItineraryGenerated, isModal = false, onClose }) => {
  const [formData, setFormData] = useState({
    region: '',
    travelers: 1,
    budget: 'medium',
    interests: [],
    accommodation: 'any',
    dietary: 'none',
    disabilityAccess: false,
    specialRequests: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const interests = [
    { id: 'beaches', label: 'Beaches', icon: '🏖️' },
    { id: 'culture', label: 'Culture', icon: '🏛️' },
    { id: 'adventure', label: 'Adventure', icon: '🏔️' },
    { id: 'food', label: 'Food', icon: '🍽️' },
    { id: 'shopping', label: 'Shopping', icon: '🛍️' },
    { id: 'nightlife', label: 'Nightlife', icon: '🎉' },
    { id: 'nature', label: 'Nature', icon: '🌿' },
    { id: 'sports', label: 'Sports', icon: '🏄' }
  ];

  const regions = [
    { id: 'north', label: 'North' },
    { id: 'south', label: 'South' },
    { id: 'east', label: 'East' },
    { id: 'west', label: 'West' },
    { id: 'central', label: 'Central' },
    { id: 'northeast', label: 'Northeast' },
    { id: 'northwest', label: 'Northwest' },
    { id: 'southeast', label: 'Southeast' },
    { id: 'southwest', label: 'Southwest' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox' && name === 'interests') {
      const updatedInterests = formData.interests.includes(value)
        ? formData.interests.filter(i => i !== value)
        : [...formData.interests, value];
      
      setFormData(prev => ({ ...prev, interests: updatedInterests }));
    } else if (type === 'checkbox' && name === 'disabilityAccess') {
      setFormData(prev => ({ ...prev, disabilityAccess: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to generate itinerary');
      }

      const data = await response.json();
      onItineraryGenerated(data);
      
      if (isModal && onClose) {
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${isModal ? 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4' : 'w-full max-w-2xl mx-auto'}`}>
      <div className={`${isModal 
        ? 'bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto' 
        : 'bg-white rounded-2xl shadow-2xl p-6 max-w-lg mx-auto'}`}>
        {isModal && (
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Plan Your Trip</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        )}
        
        {!isModal && (
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Your Itinerary</h2>
            <p className="text-gray-600 text-sm">Tell us your preferences for the perfect experience</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Region Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🌍 Region
            </label>
            <select
              name="region"
              value={formData.region}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
              required
            >
              <option value="">Select a region</option>
              {regions.map(region => (
                <option key={region.id} value={region.id}>{region.label}</option>
              ))}
            </select>
          </div>

          {/* Travelers and Budget */}
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                👥 Travelers
              </label>
              <select
                name="travelers"
                value={formData.travelers}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num} {num === 1 ? 'Traveler' : 'Travelers'}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                💰 Budget
              </label>
              <select
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
              >
                <option value="budget">Budget</option>
                <option value="medium">Mid-Range</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>
          </div>

          {/* Disability Access */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="disabilityAccess"
              checked={formData.disabilityAccess}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="ml-2 block text-sm text-gray-700">
              ♿ Disability Access Required
            </label>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ❤️ Interests
            </label>
            <div className="grid grid-cols-3 gap-2">
              {interests.map(interest => (
                <label
                  key={interest.id}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border cursor-pointer transition-all text-xs ${
                    formData.interests.includes(interest.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    name="interests"
                    value={interest.id}
                    checked={formData.interests.includes(interest.id)}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <span className="text-lg mb-1">{interest.icon}</span>
                  <span className="font-medium text-black">{interest.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Accommodation and Dietary */}
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📍 Accommodation
              </label>
              <select
                name="accommodation"
                value={formData.accommodation}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
              >
                <option value="any">Any</option>
                <option value="hotel">Hotel</option>
                <option value="resort">Resort</option>
                <option value="guesthouse">Guesthouse</option>
                <option value="airbnb">Airbnb</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🍽️ Dietary
              </label>
              <select
                name="dietary"
                value={formData.dietary}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
              >
                <option value="none">None</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="halal">Halal</option>
                <option value="kosher">Kosher</option>
                <option value="gluten-free">Gluten-Free</option>
              </select>
            </div>
          </div>

          {/* Special Requests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Special Requests
            </label>
            <textarea
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
              placeholder="Any special requirements..."
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2.5 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? 'Generating...' : 'Generate Itinerary'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ItineraryForm;