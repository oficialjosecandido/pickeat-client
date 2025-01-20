import { View, Text, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import ScreenHeader from "../components/ScreenHeader";
import { useUser } from "../context/UserContext";
import moment from "moment";
import Loader from "../components/Loader";

const Coupons = ({ navigation }) => {
  const { getMyCoupons } = useUser();

  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true);
        const coupons = await getMyCoupons();
        setCoupons(coupons);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title="Coupons" goBack={navigation.goBack} />
      {coupons.length === 0 ? (
        <Text className="text-xs text-black/70 text-center py-4">
          No coupons available at the moment.
        </Text>
      ) : (
        <ScrollView className="flex-1 bg-main-1/10 px-4">
          {coupons.map((coupon) => (
            <View
              key={coupon._id}
              className="py-6 border border-black/10 bg-white shadow shadow-sm mt-4 flex-row items-center"
            >
              <Text className="text-lg font-bold border-r border-dashed py-6 flex-1 text-center">
                {coupon.code}
              </Text>
              <View className="px-6 w-32">
                <Text className="text-3xl font-semibold text-center">
                  {coupon.discountType === "fixed"
                    ? `€${coupon.discountValue}`
                    : `${coupon.discountValue}%`}
                </Text>
              </View>
              <Text className="text-[10px] text-black/70 absolute left-4 bottom-2">
                Valid till{" "}
                <Text className="font-bold">
                  {moment(coupon.expiry).format("MMM D, YYYY")}
                </Text>
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default Coupons;
