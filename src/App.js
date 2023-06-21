import React, { useRef, useState, useEffect } from "react";
import { AiOutlineClose, AiFillPlusCircle } from "react-icons/ai";
import Moveable from "react-moveable";
import Drags from "./test/drags";

/* NOTA: Solo ocupe iconos, espero no cuente como estilo. */

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [pictures, setPictures] = useState([]);

  //Obtener las fotos desde la api indicada
  function getPictures() {
    return fetch("https://jsonplaceholder.typicode.com/photos")
      .then((response) => response.json())
      .then((data) => setPictures(data))
      .catch((error) => {
        console.log("Error:", error);
        throw error;
      });
  }

  //En el primer montado setear las fotos desde la api indicada
  useEffect(() => {
    getPictures();
  }, []);

  const addMoveable = async () => {
    // Create a new moveable component and add it to the array
    const COLORS = ["red", "blue", "yellow", "green", "purple"];

    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)], //Seteo de color random en base al array colors
        updateEnd: true,
      },
    ]);
  };

  const updateMoveable = (id, newComponent, updateEnd = false) => {
    //Actualiza el estado de los componentes Moveable
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd }; //Actualiza el item especifico del array moveableComponents
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
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
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            color={"red"}
            key={index}
            updateMoveable={updateMoveable}
            setSelected={setSelected}
            isSelected={selected === item.id}
            picture={pictures[item.id % pictures.length]}
            moveableComponents={moveableComponents}
            setMoveableComponents={setMoveableComponents}
          />
        ))}
      </div>

      {/*      <Drags /> */}
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
  index,
  color,
  id,
  setSelected,
  isSelected = false,
  picture,
  moveableComponents,
  setMoveableComponents,
}) => {
  const ref = useRef();

  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    color,
    id,
  });

  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();

  const onResize = async (e) => {
    const newWidth = Math.min(e.width, parentBounds.width - left); //Se calcula el nuevo ancho
    const newHeight = Math.min(e.height, parentBounds.height - top); // se calcula el nuevo alto

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height) {
      newHeight = parentBounds?.height - top;
    }
    if (positionMaxLeft > parentBounds?.width) {
      newWidth = parentBounds?.width - left;
    }

    updateMoveable(id, {
      top,
      left,
      width: newWidth,
      height: newHeight,
      color,
    }); // Actuazlia las medidaes del componente en cuestión

    // ACTUALIZAR NODO REFERENCIA
    const beforeTranslate = e.drag.beforeTranslate;

    //Se actualiza el nodo referencia al nuevo tamaño
    ref.current.style.width = `${e.width}px`;
    ref.current.style.height = `${e.height}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: top + translateY < 0 ? 0 : top + translateY,
      left: left + translateX < 0 ? 0 : left + translateX,
    });
  };

  const onResizeEnd = async ({ target, width, height }) => {
    //Obtengo dimensiones de parent
    const parentWidth = document.getElementById("parent").offsetWidth;
    const parentHeight = document.getElementById("parent").offsetHeight;
    // Nuevo valores de Moveable
    const newWidth = Math.min(Math.max(width, 0), parentWidth);
    const newHeight = Math.min(Math.max(height, 0), parentHeight);

    //Estilo del elemtno en cuestioón destinop
    const { top, left } = target.style;
    const newId = target.id.replace("component-", id);
    updateMoveable(
      newId,
      {
        top: parseFloat(top),
        left: parseFloat(left),
        width: newWidth,
        height: newHeight,
        color,
      },
      true
    );
  };

  const deleteMoveable = async (idComponent) => {
    let idComp = idComponent; //Id de compinente seleccionado

    let newArre = moveableComponents.filter((item) => item.id !== idComp); // filtra el id deseao a eliminar y devuelve un nuevo arreglo sin ese item en especeficio
    setMoveableComponents(newArre); // se setea la nueva desición
  };

  return (
    <>
      <div
        ref={ref}
        className="draggable"
        id={"component-" + id}
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,
          background: "yellow",
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
          onClick={() => deleteMoveable(id)}
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
        target={isSelected && ref.current}
        resizable
        draggable
        onDrag={(e) => {
          const parentWidth = document.getElementById("parent").offsetWidth;
          const parentHeight = document.getElementById("parent").offsetHeight;
          const componentWidth = width;
          const componentHeight = height;

          const newTop = Math.min(
            Math.max(e.top, 0),
            parentHeight - componentHeight
          );
          const newLeft = Math.min(
            Math.max(e.left, 0),
            parentWidth - componentWidth
          );

          updateMoveable(id, {
            top: newTop,
            left: newLeft,
            width,
            height,
            color,
          });
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
      ></Moveable>
    </>
  );
};
