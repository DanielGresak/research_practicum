import os
import pickle

def linear_regression(line, direction, wind_speed, rain_1h, clouds_all, hour, weekday, month):
    file_name = f"route_{line}_{direction}.pkl"
    model_path = os.path.join(os.path.join(os.getcwd(), "models"), file_name)
    linear_reg = pickle.load(open(model_path, 'rb'))
    inputs = []
    inputs.append(wind_speed)
    inputs.append(rain_1h)
    inputs.append(clouds_all)
    inputs.append(hour)
    weekday_list = [0] * 7
    weekday_list[(weekday-1)] = 1
    month_list = [0] * 12
    month_list[(month-1)] = 1
    inputs.extend(weekday_list)
    inputs.extend(month_list)
    travelTimeSec = round(linear_reg.predict([inputs])[0]) # round predicted seconds to the nearest integer
    print(f"Model prediciton: {travelTimeSec} seconds")
    return travelTimeSec


# def prediction(line, direction, wind_speed, rain_1h, clouds_all, hour, weekday, month):
#     name = f"route_{line}_{direction}"
#     path = f"/home/team16/tmp/data/models2/{name}.pkl"
#     linear_reg = pickle.load(open(path, 'rb'))
#     inputs = []
#     inputs.append(wind_speed)
#     inputs.append(rain_1h)
#     inputs.append(clouds_all)
#     inputs.append(hour)
#     weekday_list = [0] * 7
#     weekday_list[(weekday-1)] = 1
#     month_list = [0] * 12
#     month_list[(month-1)] = 1
#     inputs.extend(weekday_list)
#     inputs.extend(month_list)
#     model_prediction = linear_reg.predict([inputs])[0]
#     print(f"Model prediciton: {model_prediction} seconds")