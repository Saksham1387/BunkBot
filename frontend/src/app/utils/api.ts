import axios from "axios";

export async function getWallet() {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_URL}/api/v1/wallet`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data1 = response.data;
    console.log(data1);
    return data1;
  } catch (error) {
    console.error("Error fetching data:", error);
    return "Error fetching data. Please try again.";
  }
}

export async function getSeedAction() {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_URL}/api/v1/seedPhrase`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data1 = response.data;
    console.log(data1);
    return data1;
  } catch (error) {
    console.error("Error fetching data:", error);
    return "Error fetching data. Please try again.";
  }
}
