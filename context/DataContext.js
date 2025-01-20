import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const dataContext = createContext();
export const useData = () => useContext(dataContext);

const currencies = {
  usd: "$",
  eur: "€",
  gbp: "£",
};

const DataContext = ({ children }) => {
  // stadiums
  const getStadium = async (userLocation) => {
    try {
      const { longitude, latitude } = userLocation;
      const { data } = await api.get("/stadiums", {
        params: {
          longitude,
          latitude,
        },
      });
      return data;
    } catch (error) {
      console.error(`Error getting stadiums: ${error.message}`);
      return [];
    }
  };

  const getMenuItems = async (id) => {
    try {
      const { data } = await api.get(`/stadiums/${id}/menu`);
      return data;
    } catch (error) {
      console.error(`Error getting menu items: ${error.message}`);
      return [];
    }
  };

  const getStadiumPickupPoints = async (id) => {
    try {
      const { data } = await api.get(`/stadiums/${id}/pickup-points`);
      return data;
    } catch (error) {
      console.error(`Error getting pickup points: ${error.message}`);
      return [];
    }
  };

  // restuarants
  const getAvailableSlots = async (restaurantIDs) => {
    try {
      const { data } = await api.post("/stadiums/slots", { restaurantIDs });
      return data;
    } catch (error) {
      console.error("Error getting available slots", error);
    }
  };

  const provided = {
    // stadiums
    getMenuItems,
    getStadium,
    getStadiumPickupPoints,
    // restuarants
    getAvailableSlots,
    // currencies
    currencies,
  };
  return (
    <dataContext.Provider value={provided}>{children}</dataContext.Provider>
  );
};

export default DataContext;
