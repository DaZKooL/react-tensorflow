import React from "react";
import './User.css';
 
function User(props:any) {
  const [open, setOpen] = React.useState(false);
  const [count,setCount] = React.useState(0);
  const car:Car= props.car;
console.log (car)
  const showUserDetails = (car:Car) => {
    setOpen(count%2==0);
    setCount (count+1);
  }

  type Car = {
    Name:string,
    Miles_per_Gallon: number,
    Horsepower: number,
  };

  return (
    <div className="user-details" onClick={() => showUserDetails(car)}>
      {car?.Name} - {car?.Miles_per_Gallon} - {car?.Horsepower}

      {open && <li>
            details
          </li>}
     
    </div>
  );
}

export default User;
