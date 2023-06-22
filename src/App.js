/* eslint-disable */
import React, { useRef, useState, useEffect } from "react";
import { AiOutlineClose, AiFillPlusCircle } from "react-icons/ai";
import Moveable from "react-moveable";

/* NOTA: Solo ocupe iconos, espero no cuente como estilo. */
/* Esta version es una correción personal, la de entrega se encuentra en este commit 875a7db*/
const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [pictures, setPictures] = useState([]);

  // Obtener las fotos desde la api indicada
  function getPictures() {
    return fetch("https://jsonplaceholder.typicode.com/photos")
      .then((response) => response.json())
      .then((data) => setPictures(data))
      .catch((error) => {
        console.log("Error:", error);
        throw error;
      });
  }

  // En el primer montado setear las fotos desde la api indicada
  useEffect(() => {
    getPictures();
  }, []);

  const addMoveable = () => {
    // Create a new moveable component and add it to the array
    const COLORS = ["red", "blue", "yellow", "green", "purple"];

    setMoveableComponents((prevComponents) => [
      ...prevComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)], // Seteo de color random en base al array colors
        updateEnd: true,
      },
    ]);
  };

  const updateMoveable = (id, newComponent, updateEnd = false) => {
    // Actualiza el estado de los componentes Moveable
    setMoveableComponents((prevComponents) =>
      prevComponents.map((moveable) => {
        if (moveable.id === id) {
          return { id, ...newComponent, updateEnd }; // Actualiza el item específico del array moveableComponents
        }
        return moveable;
      })
    );
  };

  const deleteMoveable = (idComponent) => {
    setMoveableComponents((prevComponents) =>
      prevComponents.filter((item) => item.id !== idComponent)
    );
  };

  return (
    <main style={{ height: "100vh", width: "100vw" }}>
      <div
        style={{
          display: "flex",
          width: "70%",
          justifyContent: "space-evenly",
          alignItems: "center",
        }}
      >
        <h1>Agrega otra imagen</h1>
        <button
          style={{
            width: "200px",
            zIndex: 50,
            height: "40px",
            backgroundColor: "#21578a",
            border: "none",
            cursor: "pointer",
            borderRadius: "5px",
            alignItems: "center",
            display: "flex",
            justifyContent: "center",
          }}
          onClick={addMoveable}
        >
          <AiFillPlusCircle size={30} color="white" />
        </button>
      </div>
      <div
        id="parent"
        style={{
          position: "relative",
          background: "white",
          border: "1px solid #21578a",
          height: "80vh",
          borderRadius: "15px",
          width: "80vw",
          overflow: "hidden",
        }}
      >
        {moveableComponents.map((item) => (
          <Component
            {...item}
            key={item.id}
            updateMoveable={updateMoveable}
            setSelected={setSelected}
            isSelected={selected === item.id}
            picture={pictures[item.id % pictures.length]}
            deleteMoveable={deleteMoveable}
          />
        ))}
      </div>
    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  color,
  id,
  setSelected,
  isSelected,
  picture,
  deleteMoveable,
}) => {
  const ref = useRef();

  const onResize = (e) => {
    const parentBounds = document
      .getElementById("parent")
      .getBoundingClientRect();
    const newWidth = Math.min(e.width, parentBounds.width - left);
    const newHeight = Math.min(e.height, parentBounds.height - top);

    updateMoveable(id, {
      top,
      left,
      width: newWidth,
      height: newHeight,
      color,
    });

    // Actualizar el tamaño del componente Moveable
    e.target.style.width = `${newWidth}px`;
    e.target.style.height = `${newHeight}px`;
  };

  const onResizeEnd = ({ target, width, height }) => {
    // Obtengo dimensiones del contenedor padre
    const parentWidth = document.getElementById("parent").offsetWidth;
    const parentHeight = document.getElementById("parent").offsetHeight;

    // Calculo los nuevos valores de tamaño del componente Moveable
    const newWidth = Math.min(Math.max(width, 0), parentWidth);
    const newHeight = Math.min(Math.max(height, 0), parentHeight);

    // Obtengo las coordenadas de posición actual del elemento
    const { top, left } = target.style;

    // Calculo las nuevas coordenadas de posición izquierda y ajusto para evitar desplazamiento hacia la izquierda
    const newLeft = Math.min(parseFloat(left), parentWidth - newWidth);

    // Genero el nuevo ID para el componente
    const newId = target.id.replace("component-", id);

    // Actualizo el componente Moveable con los nuevos valores
    updateMoveable(
      newId,
      {
        top: parseFloat(top),
        left: newLeft,
        width: newWidth,
        height: newHeight,
        color,
      },
      true
    );
  };

  const handleDelete = () => {
    deleteMoveable(id);
  };

  return (
    <>
      <div
        ref={ref}
        className="draggable"
        id={`component-${id}`}
        style={{
          position: "absolute",
          top,
          left,
          width,
          height,
          background: color,
        }}
        onClick={() => setSelected(id)}
      >
        <button
          style={{
            position: "absolute",
            right: 0,
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
            cursor: "pointer",
            border: "none",
            backgroundColor: "white",
          }}
          onClick={handleDelete}
        >
          <AiOutlineClose size={30} />
        </button>
        {picture && (
          <img
            src={picture.url}
            alt="No hay Imagen"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}
      </div>
      <Moveable
        target={isSelected ? ref.current : null}
        resizable
        draggable
        onDrag={(e) => {
          const parentBounds = document
            .getElementById("parent")
            .getBoundingClientRect();
          const componentWidth = width;
          const componentHeight = height;

          const newTop = Math.min(
            Math.max(e.top, 0),
            parentBounds.height - componentHeight
          );
          const newLeft = Math.min(
            Math.max(e.left, 0),
            parentBounds.width - componentWidth
          );

          const deltaX = newLeft - left;
          const deltaY = newTop - top;

          updateMoveable(id, {
            top: newTop,
            left: newLeft,
            width,
            height,
            color,
          });

          e.target.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        }}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        zoom={1}
        origin={false}
        warpable={true}
        scalable={true}
        onScale={(e) => {
          e.target.style.transform = e.drag.transform;
        }}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
      />
    </>
  );
};
