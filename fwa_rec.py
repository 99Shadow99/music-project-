from flask import Flask, request, jsonify
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import joblib  # For saving and loading the model

app = Flask(__name__)

# Load the datasets
try:
    df = pd.read_csv('../../fma_metadata/features.csv', index_col=0, header=[0, 1, 2])
    tracks_df = pd.read_csv('../../fma_metadata/tracks.csv', index_col=0, header=[0, 1])
except FileNotFoundError:
    print("Error: Make sure 'features.csv' and 'tracks.csv' are in the '../../fma_metadata/' directory.")
    exit()

# Feature Selection and Preprocessing (same as before)
features_to_select = ['rmse', 'spectral_centroid', 'spectral_bandwidth']
feature_cols = pd.concat([df['feature', feat] for feat in features_to_select], axis=1)
feature_cols = feature_cols.fillna(feature_cols.mean())

scaler = StandardScaler()
scaled_features = scaler.fit_transform(feature_cols)
scaled_features_df = pd.DataFrame(scaled_features, index=feature_cols.index, columns=feature_cols.columns)

similarity_matrix = cosine_similarity(scaled_features_df)
similarity_df = pd.DataFrame(similarity_matrix, index=scaled_features_df.index, columns=scaled_features_df.index)

# --- Model Saving (Run this once to save the similarity_df) ---
# joblib.dump(similarity_df, 'similarity_model.joblib')
# joblib.dump(tracks_df[['track', 'artist']], 'tracks_metadata.joblib')
# ---

# --- Model Loading ---
try:
    similarity_model = joblib.load('similarity_model.joblib')
    tracks_metadata = joblib.load('tracks_metadata.joblib')
except FileNotFoundError:
    print("Error: 'similarity_model.joblib' or 'tracks_metadata.joblib' not found. Please run the model saving part first.")
    exit()
# ---

def get_track_id_from_name(track_name, tracks_df):
    """
    Finds the track ID(s) based on the track name.
    Returns a list of track IDs if multiple songs have the same name.
    """
    matching_tracks = tracks_df[tracks_df['track']['title'].str.lower() == track_name.lower()]
    if not matching_tracks.empty:
        return matching_tracks.index.tolist()
    return None

def get_recommendations(track_id, similarity_df, tracks_df, top_n=10):
    """
    Recommends the top_n most similar songs to a given track ID.
    """
    if track_id not in similarity_df.index or track_id not in tracks_df.index:
        return None

    similar_scores = similarity_df[track_id].sort_values(ascending=False)
    similar_scores = similar_scores.drop(track_id)
    top_similar_tracks = similar_scores.head(top_n)
    recommendations_df = pd.DataFrame(top_similar_tracks, columns=['similarity'])
    recommendations_df = recommendations_df.merge(tracks_df['track'][['title', 'artist']], left_index=True, right_index=True)
    recommendations = recommendations_df[['title', 'artist', 'similarity']].to_dict('records')
    return recommendations

@app.route('/recommend', methods=['POST'])
def recommend_song():
    data = request.get_json()
    if not data or 'song_name' not in data:
        return jsonify({"error": "Please provide 'song_name' in the request body."}), 400

    song_name = data['song_name']
    track_ids = get_track_id_from_name(song_name, tracks_metadata)

    if not track_ids:
        return jsonify({"error": f"Song with name '{song_name}' not found."}), 404

    all_recommendations = []
    for track_id in track_ids:
        recommendations = get_recommendations(track_id, similarity_model, tracks_metadata, top_n=10)
        if recommendations:
            all_recommendations.append({
                "input_song": tracks_metadata.loc[track_id]['track']['title'],
                "recommendations": recommendations
            })

    if not all_recommendations:
        return jsonify({"message": f"Could not generate recommendations for '{song_name}'."}), 500

    return jsonify(all_recommendations)

if __name__ == '__main__':
    # --- Run the model saving part once ---
    # features_to_select = ['rmse', 'spectral_centroid', 'spectral_bandwidth']
    # feature_cols_for_saving = pd.concat([df['feature', feat] for feat in features_to_select], axis=1)
    # feature_cols_for_saving = feature_cols_for_saving.fillna(feature_cols_for_saving.mean())
    # scaler_for_saving = StandardScaler()
    # scaled_features_for_saving = scaler_for_saving.fit_transform(feature_cols_for_saving)
    # scaled_features_df_for_saving = pd.DataFrame(scaled_features_for_saving, index=feature_cols_for_saving.index, columns=feature_cols_for_saving.columns)
    # similarity_matrix_for_saving = cosine_similarity(scaled_features_df_for_saving)
    # similarity_df_for_saving = pd.DataFrame(similarity_matrix_for_saving, index=scaled_features_df_for_saving.index, columns=scaled_features_df_for_saving.index)
    # joblib.dump(similarity_df_for_saving, 'similarity_model.joblib')
    # joblib.dump(tracks_df[['track', 'artist']], 'tracks_metadata.joblib')
    # print("Similarity model and tracks metadata saved.")
    # ---

    app.run(debug=True)  