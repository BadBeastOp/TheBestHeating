
exports.handler = async () => {
  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${process.env.GOOGLE_PLACE_ID}`,
      {
        headers: {
          "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY,
          "X-Goog-FieldMask":
            "displayName,rating,userRatingCount,googleMapsUri,reviews"
        }
      }
    );

    if (!response.ok) {
      throw new Error("Google Places API error");
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600"
      },
      body: JSON.stringify({
        rating: data.rating ?? null,
        totalReviews: data.userRatingCount ?? 0,
        googleMapsUri: data.googleMapsUri ?? "",
        reviews: (data.reviews || []).map(review => ({
          author: review.authorAttribution?.displayName || "Google user",
          authorPhoto: review.authorAttribution?.photoUri || "",
          rating: review.rating || 0,
          text: review.text?.text || "",
          date: review.relativePublishTimeDescription || "",
          reviewUrl: review.googleMapsUri || data.googleMapsUri || ""
        }))
      })
    };

  } catch (error) {
    console.error(error);

    return {
      statusCode: 502,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        error: "Unable to load Google reviews"
      })
    };
  }
};
