import React, { useState, useContext } from "react";
import Card from "../../shared/components/UIElements/Card";
import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import ImageUpload from "../../shared/components/FormElements/ImageUpload";
import {
  VALIDATOR_EMAIL,
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../shared/util/validators";
import { useForm } from "../../shared/hooks/form-hook";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/context/auth-context";
import "./Auth.css";
import axios from "axios";

const Auth = () => {
  const auth = useContext(AuthContext);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const [formState, inputHandler, setFormData] = useForm(
    {
      email: {
        value: "",
        isValid: false,
      },
      password: {
        value: "",
        isValid: false,
      },
    },
    false
  );
  const [imgUrl, setImgUrl] = useState("https://i.ibb.co/87ZFhK9/boy.jpg");
  const [selectedImage, setSelectedImage] = useState(null);
  const [errMessage, setErrMessage] = useState(null) ;
  const handleImageUpload = (file) => {
    console.log(file);
    setSelectedImage(file);
  };

  const switchModeHandler = () => {
    if (!isLoginMode) {
      setFormData(
        {
          ...formState.inputs,
          name: undefined,
        },
        formState.inputs.email.isValid && formState.inputs.password.isValid
      );
    } else {
      setFormData(
        {
          ...formState.inputs,
          name: {
            value: "",
            isValid: false,
          },
        },
        true
      );
    }
    setIsLoginMode((prevMode) => !prevMode);
  };

  const authSubmitHandler = async (event) => {
    event.preventDefault();

    if (isLoginMode) {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/users/login`,
          "POST",
          JSON.stringify({
            email: formState.inputs.email.value,
            password: formState.inputs.password.value,
          }),
          {
            "Content-Type": "application/json",
          }
        );
        auth.login(responseData.userId, responseData.token);
      } catch (err) {}
    } else {
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

            axios({
              method: "post",
              url: "/users/signup",
              baseURL: process.env.REACT_APP_BACKEND_URL,
              data: {
                name: formState.inputs.name.value,
                email: formState.inputs.email.value,
                password: formState.inputs.password.value,
                image: imgUrl,
              },
            })
              .then((res) => {
                if (res.status === 201) {
                  auth.login(res.data.userId, res.data.token);
                  console.log(res.data.userId);
                  setErrMessage(null);
                }
              })
              .catch((err) => {
                console.log(err);
                setErrMessage("failed please try again!");
              });
          }
        })
        .catch((err) => {
          console.log(err);
          setErrMessage("failed please try again!");
        });
    }
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <Card className="authentication">
        {isLoading && <LoadingSpinner asOverlay />}
        <h2>Login Required</h2>
        <hr />
        <form onSubmit={authSubmitHandler}>
          {!isLoginMode && (
            <Input
              element="input"
              id="name"
              type="text"
              label="Your Name"
              validators={[VALIDATOR_REQUIRE()]}
              errorText="Please enter a name."
              onInput={inputHandler}
            />
          )}
          {!isLoginMode && (
            <div>
              <ImageUpload
                center
                id="image"
                onInput={handleImageUpload}
                errorText="Please provide an image."
              />
              {/* <ImageUpload center id="image" onInput={inputHandler} errorText="Please provide an image." /> */}
            </div>
          )}
          <Input
            element="input"
            id="email"
            type="email"
            label="E-Mail"
            validators={[VALIDATOR_EMAIL()]}
            errorText="Please enter a valid email address."
            onInput={inputHandler}
          />
          <Input
            element="input"
            id="password"
            type="password"
            label="Password"
            validators={[VALIDATOR_MINLENGTH(6)]}
            errorText="Please enter a valid password, at least 6 characters."
            onInput={inputHandler}
          />
          <Button type="submit" disabled={!formState.isValid}>
            {isLoginMode ? "LOGIN" : "SIGNUP"}
          </Button>
        </form>
        <Button inverse onClick={switchModeHandler}>
          SWITCH TO {isLoginMode ? "SIGNUP" : "LOGIN"}
        </Button>
        {errMessage&&(<p style={{color:"red"}}>{errMessage}</p>)}
      </Card>
    </React.Fragment>
  );
};

export default Auth;
