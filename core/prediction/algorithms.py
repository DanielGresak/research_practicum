import os
import pickle
import time
from datetime import datetime

class Prediction(object):


    def __init__(self, name, model_subdir):

        self.name = name
        self.model_subdir = model_subdir
        self.feature_list = []

    def _startTiming(self):       
        self._startTime = time.perf_counter()
       

    def _stopTiming(self):        
        return time.perf_counter() - self._startTime


    def _load_model(self, line, direction):

        # Create pickle file name according to provided line and direction
        file_name = f"route_{line}_{direction}.pkl"
        # Create model path relatively to the current working directory
        # The current working directory is where 'manage.py' is being invoked
        # In our case it's '/core/'
        model_path = os.path.join(
            os.path.join(
                os.getcwd(), "prediction",
                "static", "prediction",
                "models", self.model_subdir),
            file_name)
        try:
            model = pickle.load(open(model_path, 'rb'))
        except IOError:
            print(f'Error - could not load pickle file \
                "{model_path}" from subdirectory "{self.model_subdir}"')
            return 0

        return model


    def _prepare_weather_features(self, wind_speed, rain_1h, clouds_all):

        # Append all weather details to the list
        self.feature_list.append(wind_speed)
        self.feature_list.append(rain_1h)
        self.feature_list.append(clouds_all)


    def _prepare_time_features(self, dt: datetime):

        # Append date/time details
        try:
            self.feature_list.append(dt.hour)
            weekday_list = [0] * 7
            weekday_list[(dt.weekday() - 1)] = 1
            month_list = [0] * 12
            month_list[(dt.month - 1)] = 1
            self.feature_list.extend(weekday_list)
            self.feature_list.extend(month_list)
        except TypeError as e:
            print("Error:", e)


    def get_prediction(self, line, direction, wind_speed, rain_1h, clouds_all, dt: datetime):

        # Start timing to measure the time it takes to get the prediction
        self._startTiming()
        # Prepare weather features
        self._prepare_weather_features(wind_speed, rain_1h, clouds_all)
        # Prepare time feature
        self._prepare_time_features(dt)
        # Load prediction model according to line and direction
        model = self._load_model(line, direction)
        # Invoke prediction model and round seconds to the nearest integer
        self.travel_time_sec = round(model.predict([self.feature_list])[0])
        # Stop timing
        self.execution_time = self._stopTiming()
        # Return predicted travel time in seconds,
        # and time required to get the results
        return [self.travel_time_sec, self.execution_time]



# class RandomForestPrediction(Prediction):


#     def __init__(self, name, model_subdir):
#         super.__init__(self, name, model_subdir)


#     def get_prediction(self, line, direction, wind_speed, rain_1h, clouds_all, dt: datetime):

#         # Prepare weather features
#         self._prepare_weather_features(wind_speed, rain_1h, clouds_all)
#         # Prepare time feature
#         self._prepare_time_features(dt)
#         # Load prediction model according to line and direction
#         model = self._load_model(line, direction)
#         # Invoke prediction model and round seconds to the nearest integer
#         travelTimeSec = round(model.predict([self.feature_list])[0])
#         print(f"{self.name} model prediciton: {travelTimeSec} seconds")
#         # Return predicted travel time in seconds
#         return travelTimeSec

# class LinearRegressionPrediction(Prediction):


#     def __init__(self, name, model_subdir):
#         super.__init__(self, name, model_subdir)


#     def get_prediction(self, line, direction, wind_speed, rain_1h, clouds_all, dt: datetime):

#         # Prepare weather features
#         self._prepare_weather_features(wind_speed, rain_1h, clouds_all)
#         # Prepare time feature
#         self._prepare_time_features(dt)
#         # Load prediction model according to line and direction
#         model = self._load_model(line, direction, "linearRegression")
#         # Invoke prediction model and round seconds to the nearest integer
#         travelTimeSec = round(model.predict([self.feature_list])[0])
#         print(f"{self.name} model prediciton: {travelTimeSec} seconds")
#         # Return predicted travel time in seconds
#         return travelTimeSec



# def prediction_model(
#         line, direction, wind_speed, rain_1h,
#         clouds_all, hour, weekday, month):


#     def _load_model(line, direction, model_subdir):

#         # Create pickle file name according to provided line and direction
#         file_name = f"route_{line}_{direction}.pkl"
#         # Create model path relatively to the current working directory
#         # The current working directory is where 'manage.py' is being invoked
#         # In our case it's '/core/'
#         model_path = os.path.join(
#             os.path.join(
#                 os.getcwd(), "prediction",
#                 "static", "prediction",
#                 "models", model_subdir),
#             file_name)
#         try:
#             model = pickle.load(open(model_path, 'rb'))
#         except IOError:
#             print(f'Error - could not load pickle file \
#                 "{model_path}" from subdirectory "{model_subdir}"')
#             return 0

#         return model

#     def _prepare_weather_features(wind_speed, rain_1h, clouds_all):


#     def _random_forest(
#             line, direction, wind_speed, rain_1h,
#             clouds_all, hour, weekday, month):

#         # Create an empty list for the input features
#         inputs = []
#         # Append all weather details to the list
#         inputs.append(wind_speed)
#         inputs.append(rain_1h)
#         inputs.append(clouds_all)
#         # Append date/time details
#         inputs.append(hour)
#         weekday_list = [0] * 7
#         weekday_list[(weekday-1)] = 1
#         month_list = [0] * 12
#         month_list[(month-1)] = 1
#         inputs.extend(weekday_list)
#         inputs.extend(month_list)
#         # Load prediction model according to line and direction
#         model = _load_model(line, direction, "randomForest")
#         # Invoke prediction model and round seconds to the nearest integer
#         travelTimeSec = round(model.predict([inputs])[0])
#         print(f"Model prediciton: {travelTimeSec} seconds")
#         # Return predicted travel time in seconds
#         return travelTimeSec



# def linear_regression(
#         line, direction, wind_speed, rain_1h,
#         clouds_all, hour, weekday, month):

#     # Create pickle file name according to provided line and direction
#     file_name = f"route_{line}_{direction}.pkl"
#     # Create model path relatively to the current working directory
#     # The current working directory is where 'manage.py' is being invoked
#     # In our case it's '/core/'
#     model_path = os.path.join(
#         os.path.join(
#             os.getcwd(), "prediction",
#             "static", "prediction",
#             "models", "linearRegression"),
#         file_name)
#     try:
#         linear_reg = pickle.load(open(model_path, 'rb'))
#     except IOError:
#         print(f'Error - function linear_regression could not\
#             load pickle file: {model_path}')
#         return 0
#     # Create an empty list for the input features
#     inputs = []
#     # Append all weather details to the list
#     inputs.append(wind_speed)
#     inputs.append(rain_1h)
#     inputs.append(clouds_all)
#     # Append date/time details
#     inputs.append(hour)
#     weekday_list = [0] * 7
#     weekday_list[(weekday-1)] = 1
#     month_list = [0] * 12
#     month_list[(month-1)] = 1
#     inputs.extend(weekday_list)
#     inputs.extend(month_list)
#     # Invoke prediction model and round seconds to the nearest integer
#     travelTimeSec = round(linear_reg.predict([inputs])[0])
#     print(f"Model prediciton: {travelTimeSec} seconds")
#     # Return predicted travel time in seconds
#     return travelTimeSec

# def linear_regression(
#         line, direction, wind_speed, rain_1h,
#         clouds_all, hour, weekday, month):

#     # Create pickle file name according to provided line and direction
#     file_name = f"route_{line}_{direction}.pkl"
#     # Create model path relatively to the current working directory
#     # The current working directory is where 'manage.py' is being invoked
#     # In our case it's '/core/'
#     model_path = os.path.join(
#         os.path.join(
#             os.getcwd(), "prediction",
#             "static", "prediction",
#             "models", "linearRegression"),
#         file_name)
#     try:
#         linear_reg = pickle.load(open(model_path, 'rb'))
#     except IOError:
#         print(f'Error - function linear_regression could not\
#             load pickle file: {model_path}')
#         return 0
#     # Create an empty list for the input features
#     inputs = []
#     # Append all weather details to the list
#     inputs.append(wind_speed)
#     inputs.append(rain_1h)
#     inputs.append(clouds_all)
#     # Append date/time details
#     inputs.append(hour)
#     weekday_list = [0] * 7
#     weekday_list[(weekday-1)] = 1
#     month_list = [0] * 12
#     month_list[(month-1)] = 1
#     inputs.extend(weekday_list)
#     inputs.extend(month_list)
#     # Invoke prediction model and round seconds to the nearest integer
#     travelTimeSec = round(linear_reg.predict([inputs])[0])
#     print(f"Model prediciton: {travelTimeSec} seconds")
#     # Return predicted travel time in seconds
#     return travelTimeSec
