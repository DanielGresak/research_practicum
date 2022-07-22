import os
import pickle

def linear_regression(line, direction, wind_speed, rain_1h,\
    clouds_all, hour, weekday, month):


    # Create pickle file name according to provided line and direction
    file_name = f"route_{line}_{direction}.pkl"
    # Create model path relatively to the current working directory
    # The current working directory is where 'manage.py' is being invoked
    # In our case it's '/core/'
    model_path = os.path.join(os.path.join(os.getcwd(),\
        "prediction", "models", "linearRegression"), file_name)
    try:
        linear_reg = pickle.load(open(model_path, 'rb'))
    except IOError:
        print(f'Error - function linear_regression could not\
            load pickle file: {model_path}')
        return 0
    # Create an empty list for the input features
    inputs = []
    # Append all weather details to the list
    inputs.append(wind_speed)
    inputs.append(rain_1h)
    inputs.append(clouds_all)
    # Append date/time details
    inputs.append(hour)
    weekday_list = [0] * 7
    weekday_list[(weekday-1)] = 1
    month_list = [0] * 12
    month_list[(month-1)] = 1
    inputs.extend(weekday_list)
    inputs.extend(month_list)
    # Invoke prediction model and round seconds to the nearest integer
    travelTimeSec = round(linear_reg.predict([inputs])[0]) 
    print(f"Model prediciton: {travelTimeSec} seconds")
    # Return predicted travel time in seconds
    return travelTimeSec
