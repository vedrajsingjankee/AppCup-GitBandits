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
    const hour = parseInt(String(timeOfDay).split(':')[0]);
    if (isNaN(hour)) return '🕘';
    if (hour < 12) return '🌅';
    if (hour < 17) return '☀️';
    return '🌆';
  };

  const showAccessibility = Boolean(itinerary?.preferences?.disabilityAccess);

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
            {Array.isArray(dailyPlan) && dailyPlan.length > 0 ? (
              <div className="space-y-6">
                {dailyPlan.map((item, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getTimeIcon(item.time)}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-gray-600">🕐 {item.time}</span>
                        </div>
                        <h5 className="font-medium text-gray-800">{item.title || item.activity}</h5>
                        <p className="text-gray-600 text-sm">{item.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-600">📍 {item.location}</span>
                        </div>
                        {Array.isArray(item.tips) && item.tips.length > 0 && (
                          <div className="mt-2 text-sm text-gray-700">
                            <div className="font-medium">Travel tips:</div>
                            <ul className="list-disc ml-5">
                              {item.tips.map((t, i) => (
                                <li key={i}>{t}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {item.guide && (
                          <div className="mt-2 text-sm text-gray-700">
                            <div className="font-medium">Guide:</div>
                            <p>{item.guide}</p>
                          </div>
                        )}
                        {item.cost && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-600">💰 {formatCurrency(item.cost)}</span>
                          </div>
                        )}
                      </div>
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
                {recommendations.map((rec, index) => {
                  const name = rec?.metadata?.name || rec?.name || rec?.title;
                  const description = rec?.metadata?.description || rec?.description;
                  const bestTime = rec?.metadata?.best_time || rec?.best_time || rec?.bestTime;
                  const location = rec?.metadata?.location || rec?.location;
                  const activity = rec?.metadata?.activity || rec?.activity;
                  const features = rec?.metadata?.features || rec?.features || [];
                  const tips = rec?.metadata?.tips || rec?.tips || [];
                  const guide = rec?.metadata?.guide || rec?.guide || '';

                  return (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-lg">⭐</span>
                        <div>
                          <h4 className="font-bold text-gray-800">{name}</h4>
                          {description && (
                            <p className="text-gray-600 text-sm">{description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                            {bestTime && <span>🕘 {bestTime}</span>}
                            {location && <span>📍 {location}</span>}
                            {activity && <span>🎯 {activity}</span>}
                          </div>
                          {showAccessibility && features.length > 0 && (
                            <div className="mt-2 text-sm text-gray-700">
                              <div className="font-medium">Accessibility features:</div>
                              <ul className="list-disc ml-5">
                                {features.map((f, i) => (
                                  <li key={i}>{f}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {Array.isArray(tips) && tips.length > 0 && (
                            <div className="mt-2 text-sm text-gray-700">
                              <div className="font-medium">Travel tips:</div>
                              <ul className="list-disc ml-5">
                                {tips.map((t, i) => (
                                  <li key={i}>{t}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {guide && (
                            <div className="mt-2 text-sm text-gray-700">
                              <div className="font-medium">Guide:</div>
                              <p>{guide}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500">No recommendations available.</p>
            )}
          </div>

          {/* Accommodation / Hotel Recommendation */}
          {(itinerary?.hotel_recommendation || itinerary?.accommodation || Array.isArray(itinerary?.accommodations)) && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Recommended Accommodation</h3>
              {(() => {
                const hotel = itinerary?.hotel_recommendation || itinerary?.accommodation;
                const hotels = Array.isArray(itinerary?.accommodations) ? itinerary.accommodations : (hotel ? [hotel] : []);
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {hotels.map((h, idx) => (
                      <div key={idx} className="border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-lg">🏨</span>
                          <div>
                            <h4 className="font-bold text-gray-800">{h?.name || h?.title || 'Accommodation'}</h4>
                            {h?.location && (
                              <p className="text-gray-600 text-sm">📍 {h.location}</p>
                            )}
                            {h?.description && (
                              <p className="text-gray-600 text-sm mt-1">{h.description}</p>
                            )}
                            {(h?.price_range || h?.priceRange) && (
                              <p className="text-sm text-gray-700 mt-1">Price: {h?.price_range || h?.priceRange}</p>
                            )}
                            {showAccessibility && Array.isArray(h?.accessible_features) && h.accessible_features.length > 0 && (
                              <div className="mt-2 text-sm text-gray-700">
                                <div className="font-medium">Accessibility features:</div>
                                <ul className="list-disc ml-5">
                                  {h.accessible_features.map((f, i) => (
                                    <li key={i}>{f}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

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