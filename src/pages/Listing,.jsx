import React, { useEffect, useRef, useState } from "react";
import Card from "../components/Card";
import Button from "../components/Button";
import { useFirebase } from "../service/firebase";
import {
  query,
  getFirestore,
  collection,
  getDocs,
  where,
  addDoc,
} from "firebase/firestore";
import data from "./data.json";

const landArray = [
  {
    url: "https://example.com",
    image:
      "https://a0.muscache.com/im/pictures/miso/Hosting-48224861/original/ea78d580-d19d-49e2-8657-f01154e786ca.jpeg?im_w=720",
    des: "Details for item 1.",
    headline: "Information about land 1.",
  },
  {
    url: "https://example.com",
    image:
      "https://a0.muscache.com/im/pictures/miso/Hosting-52960006/original/6e21b2e3-4a50-44f7-9641-dc9ae2e2ef4e.jpeg?im_w=720",
    des: "Details for item 2.",
    headline: "Information about land 2.",
  },
  {
    url: "https://example.com",
    image:
      "https://a0.muscache.com/im/pictures/miso/Hosting-52960006/original/6e21b2e3-4a50-44f7-9641-dc9ae2e2ef4e.jpeg?im_w=720",
    des: "Details for item 3.",
    headline: "Information about land 3.",
  },
];

const defaultFilters = {
  type: "all",
  range: "all",
};

function Filters({ filters, onChange }) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="flex flex-col gap-3 justify-start items-start w-full mb-5">
      <div className="flex w-full gap-3">
        <Button
          onClick={() => {
            setShowFilters((it) => !it);
          }}
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Button>

        <input
          type="text"
          placeholder="Search"
          className="input input-bordered w-full"
        />
      </div>

      {showFilters && (
        <div className=" flex flex-col gap-1 w-full">
          <div className="flex gap-3 w-full">
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">Order by</span>
              </div>

              <select className="select select-bordered w-full">
                <option disabled selected>
                  None
                </option>
                <option>Proximity</option>
                <option>Price</option>
                <option>Rating</option>
              </select>
            </label>

            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">Filter by type</span>
              </div>

              <select
                className="select select-bordered"
                onChange={(e) => onChange({ ...filters, type: e.target.value })}
              >
                <option value={"all"}>All</option>
                <option value={"Plot"}>{"Plot"}</option>
                <option value={"Villa"}>{"Villa"}</option>
                <option value={"Apartment"}>{"Apartment"}</option>
              </select>
            </label>

            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">Filter by distance</span>
              </div>

              <select className="select select-bordered">
                <option disabled selected>
                  All
                </option>
                <option>{"< 5km"}</option>
                <option>{"< 10km"}</option>
                <option>{"< 30km"}</option>
                <option>{"< 50km"}</option>
              </select>
            </label>

            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">Filter by range</span>
              </div>

              <select
                defaultValue={"all"}
                onChange={(e) =>
                  onChange({ ...filters, range: e.target.value })
                }
                className="select select-bordered"
              >
                <option value="all">All</option>
                <option value="0_5000000">{"< 50L"}</option>
                <option value="5000000_7500000">{"50L to 75L"}</option>
                <option value="7500000_9000000">{"75 to 90L"}</option>
                <option value="9000000_10000000">{"90L to 1Cr"}</option>
                <option value="gtcr">{"1Cr+"}</option>
              </select>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

function useListingItems(filters) {
  const app = useFirebase();
  const db = getFirestore(app);

  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!db) return;

    let conditions = [];
    if (filters.type !== "all") {
      conditions.push(where("area_type", "==", filters.type));
    }

    if (filters.range !== "all") {
      if (filters.range === "gtcr") {
        conditions.push(where("price", ">", 10000000));
      } else {
        const [l, u] = filters.range.split("_");
        console.log(l, u);
        conditions.push(where("price", ">", +l));
        conditions.push(where("price", "<", +u));
      }
    }

    const listingQuery = query(collection(db, "property"), ...conditions);

    setIsLoading(true);

    getDocs(listingQuery)
      .then((snap) => {
        setItems(snap.docs.map((it) => ({ ...it.data(), id: it.id })));
      })
      .finally(() => setIsLoading(false));
  }, [filters]);

  return { items, isLoading };
}

function Listing() {
  const [filters, setFilters] = useState(defaultFilters);
  const { items, isLoading } = useListingItems(filters);

  return (
    <div className="lg:mx-60 mx-4 min-h-screen">
      <Filters filters={filters} onChange={setFilters} />

      {isLoading && (
        <div className="w-full flex justify-center mt-10">
          <div className="loading loading-dots loading-lg"></div>
        </div>
      )}

      {!isLoading && !items.length && (
        <p className=" text-xl text-center">{"No results found :("}</p>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {items.map((item) => {
          const labels = [];

          const size = item.size && `${item.size} BHK`;
          if (size) labels.push(size);
          labels.push(item.availability);

          return (
            <Card
              description={item.area_type}
              headline={item.property_name}
              url={landArray[0].image}
              labels={labels}
              key={item.id}
              seller={item.seller_name}
              area={item.site_location}
              price={item.price}
              item={item}
            />
          );
        })}
      </div>
    </div>
  );
}

export default Listing;