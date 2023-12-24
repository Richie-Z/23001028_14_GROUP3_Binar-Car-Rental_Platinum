import React from 'react'
import './login.css'
import loginimage from "../../assets/image/login-image.png"
import { useState } from "react";
import axios from 'axios';

import { useNavigate } from "react-router-dom";
const SignIn = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
 
  const navigate = useNavigate()

  
  const handleEmailLogin = (e) => {
    setEmail(e.target.value)
  }
  const handlePasswordLogin = (e) => {
    setPassword(e.target.value)
  }
  
  
  const handleLogin = () => {
    // console.log("test")
    const payload = {
      email: email,
      password: password,
      role: "Admin"
    }
    axios.post("https://api-car-rental.binaracademy.org/admin/auth/login", payload)
    .then ((res) => {
      console.log("test", res)
    localStorage.setItem("access_token", res.data.access_token)
    navigate("/admin/menu")
    })
    .catch ((err) => console.log(err))


   

  }
  return (
    <>
      <section>
        <div className="row min-vh-100">
          <div className="col-lg-8 left">
            <div className="gambar">
              <img src={loginimage} alt="" />
            </div>
          </div>
          <div className="col-lg-4 d-flex justify-content-center ">
            <div className="right">
              {/* <p>{Succsess}</p> */}
              <div className="logo"></div>
              <h1>welcome, admin BCR</h1>
              <form action="">
                <div className="d-flex flex-column mb-3">
                  <label htmlFor="" className="mb-2">email</label>
                  <input onChange={handleEmailLogin} type="text" placeholder="ex:admin@mail.com" />

                </div>
                <div className="d-flex flex-column">
                  <label htmlFor="" className='mb-2'>password</label>
                  <input onChange={handlePasswordLogin} type="" placeholder="6+ caracter" />
                </div>
                <a onClick={handleLogin} className="text-center">sign In</a>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default SignIn