import React from "react";
import User from "../User";
import "./UserList.css";
import * as tf from "@tensorflow/tfjs";
import * as tfvis from "@tensorflow/tfjs-vis";

function UsersList(props: any) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [data, setData] = React.useState([]);
  let tensorData: { inputs: any; labels: any; inputMax?: tf.Tensor<tf.Rank>; inputMin?: tf.Tensor<tf.Rank>; labelMax?: tf.Tensor<tf.Rank>; labelMin?: tf.Tensor<tf.Rank>; };

  React.useEffect(() => {
    const results: [] = props.results;

    //const url = "https://randomuser.me/api/?results=" + results;
    const url = "https://storage.googleapis.com/tfjs-tutorials/carsData.json";

    const processJsonData = (json: any) => {
      console.log('Json',json);
      json = json.filter((car:Car) => (car.Horsepower != null && car.Miles_per_Gallon != null));
      console.log('Json2',json);

      setData(json);
    };
    fetch(url)
      .then((response) => response.json())
      .then((json) => processJsonData(json))
      .catch((error) => console.log(error));
  }, []);
  //  .filter(car => (car.mpg != null && car.horsepower != null));

  React.useEffect(() => {
    if (data.length !== 0) {
      setIsLoading(false);
    }
    console.log("data:", data);
  }, [data]);

  type Car = {
    Name: string;
    Miles_per_Gallon: number;
    Horsepower: number;
  };

  let values = data.map((car: Car) => ({
    x: car.Miles_per_Gallon,
    y: car.Horsepower,
  }));

  tfvis.render.scatterplot(
    { name: "Horsepower v MPG" },
    { values },
    {
      xLabel: "Horsepower",
      yLabel: "MPG",
      height: 300,
    }
  );

  function createModel() {
    // Create a sequential model
    const model = tf.sequential();
  
    // Add a single input layer
    model.add(tf.layers.dense({inputShape: [1], units: 1, useBias: true}));
  
    // Add an output layer
    model.add(tf.layers.dense({units: 1, useBias: true}));
  
    return model;
  }

  // Create the model
  const model = createModel();
  tfvis.show.modelSummary({ name: "Model Summary" }, model);

  /**
   * Convert the input data to tensors that we can use for machine
   * learning. We will also do the important best practices of _shuffling_
   * the data and _normalizing_ the data
   * MPG on the y-axis.
   */

  function convertToTensor(data: any) {
    // Wrapping these calculations in a tidy will dispose any
    // intermediate tensors.
    return tf.tidy(() => {
      // Step 1. Shuffle the data
      tf.util.shuffle(data);

      // Step 2. Convert data to Tensor
      console.log("datazza", data);
      const inputs = data.map((d: any) => d.Horsepower);
      const labels = data.map((d: any) => d.Miles_per_Gallon);
      console.log ('inputs',inputs)
      const inputTensor = tf.tensor2d(inputs, [inputs.length, 1]);
      const labelTensor = tf.tensor2d(labels, [labels.length, 1]);

      //Step 3. Normalize the data to the range 0 - 1 using min-max scaling
      const inputMax = inputTensor.max();
      const inputMin = inputTensor.min();
      const labelMax = labelTensor.max();
      const labelMin = labelTensor.min();

      const normalizedInputs = inputTensor
        .sub(inputMin)
        .div(inputMax.sub(inputMin));
      const normalizedLabels = labelTensor
        .sub(labelMin)
        .div(labelMax.sub(labelMin));

      // Step 1. Shuffle the data
      tf.util.shuffle(data);

      return {
        inputs: normalizedInputs,
        labels: normalizedLabels,
        // Return the min/max bounds so we can use them later.
        inputMax,
        inputMin,
        labelMax,
        labelMin,
      };
    });
  }

  interface dataModel {
    Horsepower: number;
    Miles_per_Gallon: number;
  }

  // Step 2. Convert data to Tensor
  const inputs = data.map((d: dataModel) => d.Horsepower);
  const labels = data.map((d: dataModel) => d.Miles_per_Gallon);
  console.log("data at this very point", data, inputs, labels);

  let inputMax, inputMin, labelMax, labelMin;
  let inputTensor, labelTensor;
  if (data.length) {
    inputTensor = tf.tensor2d(inputs, [inputs.length, 1]);
    labelTensor = tf.tensor2d(labels, [labels.length, 1]);
    //Step 3. Normalize the data to the range 0 - 1 using min-max scaling
    inputMax = inputTensor.max();
    inputMin = inputTensor.min();
    labelMax = labelTensor.max();
    labelMin = labelTensor.min();

    const normalizedInputs = inputTensor.sub(inputMin);
    const normalizedLabels = labelTensor
      .sub(labelMin)
      .div(labelMax.sub(labelMin));
  }

  async function trainModel(model: any, inputs: [], labels: []) {
    // Prepare the model for training.
    model.compile({
      optimizer: tf.train.adam(),
      loss: tf.losses.meanSquaredError,
      metrics: ["mse"],
    });

    const batchSize = 32;
    const epochs = 50;

    return await model.fit(inputs, labels, {
      batchSize,
      epochs,
      shuffle: true,
      callbacks: tfvis.show.fitCallbacks(
        { name: "Training Performance" },
        ["loss", "mse"],
        { height: 200, callbacks: ["onEpochEnd"] }
      ),
    });
  }

  // Convert the data to a form we can use for training.
  if (data.length) {
    tensorData = convertToTensor(data);
    console.log("datalla", data, tensorData);
    const tensorDataInputs: any = tensorData.inputs;
    const tensorDataLabels: any = tensorData.labels;

    // Train the model
    trainModel(model, tensorDataInputs, tensorDataLabels);
    console.log("Done Training");
  }

  function testModel(model:any, inputData:any, normalizationData:any) {
    const {inputMax, inputMin, labelMin, labelMax} = normalizationData;
  console.log ('testata', model,inputData, normalizationData);
    // Generate predictions for a uniform range of numbers between 0 and 1;
    // We un-normalize the data by doing the inverse of the min-max scaling
    // that we did earlier.
    const [xs, preds] = tf.tidy(() => {
  
      const xs = tf.linspace(0, 1, 100);
      const preds = model.predict(xs.reshape([100, 1]));
  
      const unNormXs = xs
        .mul(inputMax.sub(inputMin))
        .add(inputMin);
  
      const unNormPreds = preds
        .mul(labelMax.sub(labelMin))
        .add(labelMin);
  
      // Un-normalize the data
      return [unNormXs.dataSync(), unNormPreds.dataSync()];
    });
  
  
    const predictedPoints = Array.from(xs).map((val, i) => {
      return {x: val, y: preds[i]}
    });
    const originalPoints = inputData.map((d:any) => ({
      x: d.horsepower, y: d.mpg,
    }));
    console.log ('predictedPoints',predictedPoints)

  
    tfvis.render.scatterplot(
      {name: 'Model Predictions vs Original Data'},
      {values: [originalPoints, predictedPoints], series: ['original', 'predicted']},
      {
        xLabel: 'Horsepower',
        yLabel: 'MPG',
        height: 300
      }
    );
  }

  // Make some predictions using the model and compare them to the
// original data
if (data.length) {
setTimeout (()=>(testModel(model, data, tensorData)),12000)
}

  return (
    <div>
      {isLoading ? (
        <h1>Loading...</h1>
      ) : (
        <>
          <ul className="user-list">
            {data.map((car: Car, index) => (
              <User key={index} car={car} />
            ))}
            ; return cleaned;
          </ul>
        </>
      )}
      )
    </div>
  );
}

export default UsersList;
