import React, { useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH,
} from "../../shared/util/validators";
import { useForm } from "../../shared/hooks/form-hook";
import "./PlaceForm.css";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/context/auth-context";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import ImageUpload from "../../shared/components/FormElements/ImageUpload";
import axios from "axios";

const NewPlace = () => {
  const auth = useContext(AuthContext);
  const { isLoading, error, clearError } = useHttpClient();
  const [formState, inputHandler] = useForm(
    {
      title: {
        value: "",
        isValid: false,
      },
      description: {
        value: "",
        isValid: false,
      },
      address: {
        value: "",
        isValid: false,
      },
      image: {
        value: null,
        isValid: true,
      },
      latitude: {
        value: 0,
        isValid: false,
      },
      longitude: {
        value: 0,
        isValid: false,
      },
    },
    false
  );
  const [imgUrl, setImgUrl] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [errMessage, setErrMessage] = useState(null);
  const handleImageUpload = (file) => {
    console.log(file);
    setSelectedImage(file);
  };
  const history = useHistory();

  //  console.log(auth.userId) ;

  const placeSubmitHandler = async (event) => {
    event.preventDefault();
    let body = new FormData();
    body.set("key", process.env.REACT_APP_IMGBB_SECRET_KEY);
    body.append("image", selectedImage);
    axios({
      method: "post",
      url: "/1/upload",
      baseURL: process.env.REACT_APP_IMGBB_URL,
      data: body,
    })
      .then((res) => {
        if (res.data.status === 200) {
          setImgUrl(res.data.data.url);
          console.log(res.data.data.url);
        }
      })
      .catch((err) => {
        console.log(err);
        setErrMessage("failed please try again!");
      });

    if(imgUrl){
      axios({
        method: "post",
        url: "/places",
        baseURL: process.env.REACT_APP_BACKEND_URL,
        data: {
          title: formState.inputs.title.value,
          description: formState.inputs.description.value,
          address: formState.inputs.address.value,
          image: imgUrl,
          latitude: formState.inputs.latitude.value,
          longitude: formState.inputs.longitude.value,
          creator: auth.userId,
        },
        headers: {
          Authorization: "Bearer " + auth.token,
        },
      })
        .then((res) => {
          history.push("/");
        })
        .catch((err) => {
          console.log(err);
          setErrMessage("failed please try again!");
        });
    }
    // try {
    //   const formData = new FormData();
    //   formData.append("title", formState.inputs.title.value);
    //   formData.append("description", formState.inputs.description.value);
    //   formData.append("address", formState.inputs.address.value);
    //   formData.append("image", imgUrl);
    //   formData.append("latitude", formState.inputs.latitude.value);
    //   formData.append("longitude", formState.inputs.longitude.value);
    //   formData.append("creator", auth.userId);
    //   await sendRequest(process.env.REACT_APP_BACKEND_URL+'/places', "POST", formData, {
    //     Authorization: "Bearer " + auth.token,
    //   });
    //   history.push("/");
    // } catch (err) {}
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError}></ErrorModal>
      <form className="place-form" onSubmit={placeSubmitHandler}>
        {isLoading && <LoadingSpinner asOverlay />}
        <Input
          id="title"
          element="input"
          type="text"
          label="Title"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid title."
          onInput={inputHandler}
        />
        <Input
          id="description"
          element="textarea"
          label="Description"
          validators={[VALIDATOR_MINLENGTH(5)]}
          errorText="Please enter a valid description (at least 5 characters)."
          onInput={inputHandler}
        />
        <Input
          id="address"
          element="input"
          label="Address"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid address."
          onInput={inputHandler}
        />
        <ImageUpload
          id="image"
          center="true"
          onInput={handleImageUpload}
          errorText="Please provide an image."
        />
        <Input
          id="latitude"
          element="input"
          type="Number"
          label="latitude of your address"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="This can't be remain empty atleast write 0."
          onInput={inputHandler}
        />
        <Input
          id="longitude"
          element="input"
          type="Number"
          label="longitude of your address"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="This can't be remain empty atleast write 0."
          onInput={inputHandler}
        />
        <Button type="submit" disabled={!formState.isValid}>
          ADD PLACE
        </Button>
        {errMessage&&(<p style={{color:"red"}}>{errMessage}</p>)}
      </form>
    </React.Fragment>
  );
};

export default NewPlace;
