import React, { useEffect } from "react";
import "./style.css"
import { getMenu } from "../../redux/features/menuCar/menuSlicer";
import { deleteCar } from "../../redux/features/deleteCar/deleteSlice";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../../component/Navbar";
import LeftNavbar from "../../component/LeftNavbar";
const MenuCar = () => {
  const dispatch = useDispatch()
  const {list}= useSelector((state) => state.menuCar)
console.log(list)
useEffect(() => {
  dispatch(getMenu())
},[])

const handleDelete = (id) => {
  dispatch(deleteCar(id))
  console.log( "<<<<")

}
  
  return (
    <div className="container-bg">
        <Navbar/>
        {/* <LeftNavbar/> */}
      <div className="information-cars">
        <p>List Cars</p>
        <button>Add New Car</button>
      </div>
      <div className="category-car">
        <button>All</button>
        <button>2 - 4 people</button>
        <button>4 - 6 people</button>
        <button>6 - 8 people</button>
      </div>
      <div className="container-post-card">
      {list.map((item, index) => (
        <div key={index}>
          <div className="post-card">
            <div className="text">
              <img className="image" src={item.image}/>
              <p>{item.name}</p>
              <p>Rp {item.price} /hari</p>
              <p>{item.category}</p>
            </div>
            <div className="button">
              <button onClick={() => handleDelete()} className="delete">Delete</button>
              <button className="edit">Edit</button>
            </div>
          </div>
        </div>
     ))}
      
        </div>
      </div>
  )
}

export default MenuCar