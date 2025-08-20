import React from 'react';

const ItineraryResults = ({ itinerary, onClose, onRegenerate }) => {
  const { summary, itinerary: dailyPlan, recommendations, estimatedCost } = itinerary;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTimeIcon = (timeOfDay) => {
    const hour = parseInt(timeOfDay.split(':')[0]);
    if (hour < 12) return '🌅';
    if (hour < 17) return '☀️';
    return '🌆';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Your Personalized Itinerary</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="p-6">
          {/* Summary Section */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Trip Summary</h3>
            <p className="text-gray-600">{summary}</p>
          </div>

          {/* Daily Itinerary */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Daily Plan</h3>
            {dailyPlan && dailyPlan.length > 0 ? (
              <div className="space-y-6">
                {dailyPlan.map((day, dayIndex) => (
                  <div key={dayIndex} className="border rounded-lg p-4">
                    <h4 className="font-bold text-lg text-gray-800 mb-3">
                      Day {dayIndex + 1}
                    </h4>
                    <div className="space-y-4">
                      {day.activities && day.activities.map((activity, activityIndex) => (
                        <div key={activityIndex} className="flex items-start gap-3">
                          <span className="text-2xl">{getTimeIcon(activity.time)}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm text-gray-600">🕐 {activity.time}</span>
                            </div>
                            <h5 className="font-medium text-gray-800">{activity.title}</h5>
                            <p className="text-gray-600 text-sm">{activity.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-gray-600">📍 {activity.location}</span>
                            </div>
                            {activity.cost && (
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-gray-600">💰 {formatCurrency(activity.cost)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No daily itinerary available.</p>
            )}
          </div>

          {/* Recommendations */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Recommendations</h3>
            {recommendations && recommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">⭐</span>
                      <div>
                        <h4 className="font-bold text-gray-800">{rec.title}</h4>
                        <p className="text-gray-600 text-sm">{rec.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm text-gray-600">📍 {rec.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No recommendations available.</p>
            )}
          </div>

          {/* Estimated Cost */}
          {estimatedCost && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">💰</span>
                <h3 className="text-lg font-bold text-gray-800">Estimated Cost</h3>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total for trip:</span>
                <span className="text-xl font-bold text-blue-600">
                  {formatCurrency(estimatedCost.total)}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Accommodation:</span>
                  <span>{formatCurrency(estimatedCost.accommodation)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Food:</span>
                  <span>{formatCurrency(estimatedCost.food)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Activities:</span>
                  <span>{formatCurrency(estimatedCost.activities)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transportation:</span>
                  <span>{formatCurrency(estimatedCost.transportation)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onRegenerate}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Regenerate Itinerary
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryResults;