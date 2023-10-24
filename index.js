require("dotenv").config();

const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const { ACCESS_KEY, SECRET_ACCESS_KEY } = process.env;

const main = async () => {
  const imageStream = fs.createReadStream("./images/Rockfish.jpeg");

  const formData = new FormData();
  formData.append("file", imageStream);

  const imgUrl = await uploadImgToPinata(formData);
  console.log("Pinata에 이미지 저장이 완료되었습니다. : ", imgUrl);

  // 메타데이터
  const metaData = {
    name: "우럭",
    description: "우럭아 왜 우럭...",
    image: imgUrl,
  };

  const tokenUri = await jsonToPinata(metaData);
  console.log("Pinata에 메타데이터 저장이 완료되었습니다. : ", tokenUri);
};

const uploadImgToPinata = async (data) => {
  // 이 함수의 매개변수로 들어오는 data는 FormData 객체 입니다.

  try {
    const res = await axios
      .post("https://api.pinata.cloud/pinning/pinFileToIPFS", data, {
        maxContentLength: "Infinity",
        headers: {
          "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
          pinata_api_key: `${ACCESS_KEY}`, // ACCESS_KEY는 Pinata의 'API Key'입니다.
          pinata_secret_api_key: `${SECRET_ACCESS_KEY}`, // SECRET_ACCESS_KEY는 Pinata의 'API Secret'입니다.
        },
      })
      .then((res) => {
        return `ipfs://${res.data.IpfsHash}`; // 예제의 'ipfs://Qmf1xUQnQHVDWhbXhMjqrWBCugDhmhSQvvfpQfd8ePoxCS' 와 같은 형식으로 만들었습니다.
      })
      .catch((err) => {
        console.log(err);
      });

    return res;
  } catch (err) {
    console.error(err);
  }
};

const jsonToPinata = async (metaData) => {
  try {
    const baseUrl = "https://gateway.pinata.cloud/ipfs/"; // Pinata에 Metadata를 저장하고 나면 얻을 수 있는 ipfs hash값을 엔드포인트로 넣어야 합니다.
    const data = JSON.stringify({
      // Pinata가 요구하는 데이터의 구조입니다.
      pinataMetadata: {
        name: metaData.name,
      },
      pinataContent: metaData,
    });

    const res = await axios
      .post("https://api.pinata.cloud/pinning/pinJSONToIPFS", data, {
        headers: {
          "Content-Type": "application/json",
          pinata_api_key: `${ACCESS_KEY}`, // ACCESS_KEY는 Pinata의 'API Key'입니다.
          pinata_secret_api_key: `${SECRET_ACCESS_KEY}`, // SECRET_ACCESS_KEY는 Pinata의 'API Secret'입니다.
        },
      })
      .then((res) => {
        const result = `${baseUrl}${res.data.IpfsHash}`; // result 예시 => "https://gateway.pinata.cloud/ipfs/Qmf1xUQnQHVDWhbXhMjqrWBCugDhmhSQvvfpQfd8ePoxCS"
        return result;
      });

    return res;
  } catch (err) {
    console.error(err);
  }
};

main();
