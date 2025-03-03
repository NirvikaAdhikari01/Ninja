import React, { useEffect, useState } from "react";
import { fetchAllPersonalTrainingInstructors } from "@/services";

const PersonalTrainingPage = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getInstructors = async () => {
      const response = await fetchAllPersonalTrainingInstructors();
      if (response.success) {
        setInstructors(response.data);
      }
      setLoading(false);
    };

    getInstructors();
  }, []);

  if (loading) return <p>Loading instructors...</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Personal Training Instructors</h1>
      {instructors.length === 0 ? (
        <p>No instructors available.</p>
      ) : (
        <div className="grid gap-6">
          {instructors.map((instructor) => (
            <div key={instructor._id} className="flex border rounded-lg p-4 shadow-md">
              {/* Left Side: Introduction Video */}
              <div className="w-1/3">
                <video className="w-full rounded-lg" controls>
                  <source src={instructor.introVideo} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Right Side: Instructor Details */}
              <div className="w-2/3 pl-6 flex flex-col">
                <h2 className="text-xl font-semibold">{instructor.name}</h2>
                <p className="text-gray-600">{instructor.introduction}</p>

                {/* Available Slots */}
                <div className="mt-auto">
                  <h3 className="text-lg font-semibold">Available Slots</h3>
                  <ul className="list-disc list-inside">
                    {instructor.availableSlots.length > 0 ? (
                      instructor.availableSlots.map((slot, index) => (
                        <li key={index}>{slot}</li>
                      ))
                    ) : (
                      <li>No slots available</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PersonalTrainingPage;
