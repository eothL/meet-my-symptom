export const REGION_DEFINITIONS = [
  {
    id: "front_head",
    label: "Front head",
    view: "front",
    x: 106,
    y: 18,
    w: 28,
    h: 30,
    subregions: ["Forehead", "Temple", "Jawline"]
  },
  {
    id: "front_neck",
    label: "Front neck",
    view: "front",
    x: 110,
    y: 52,
    w: 20,
    h: 20,
    subregions: ["Upper neck", "Throat area", "Base of neck"]
  },
  {
    id: "front_chest_center",
    label: "Front chest (center)",
    view: "front",
    x: 85,
    y: 78,
    w: 70,
    h: 38,
    subregions: ["Upper chest", "Mid chest", "Lower chest"]
  },
  {
    id: "front_abdomen_upper",
    label: "Upper abdomen",
    view: "front",
    x: 91,
    y: 121,
    w: 58,
    h: 34,
    subregions: ["Upper left", "Upper center", "Upper right"]
  },
  {
    id: "front_abdomen_lower",
    label: "Lower abdomen",
    view: "front",
    x: 94,
    y: 158,
    w: 52,
    h: 34,
    subregions: ["Lower left", "Lower center", "Lower right"]
  },
  {
    id: "front_pelvis",
    label: "Pelvic region",
    view: "front",
    x: 90,
    y: 195,
    w: 60,
    h: 30,
    subregions: ["Left pelvis", "Center pelvis", "Right pelvis"]
  },
  {
    id: "front_shoulder_left",
    label: "Left shoulder (front)",
    view: "front",
    x: 52,
    y: 80,
    w: 28,
    h: 26,
    subregions: ["Front shoulder cap", "Collarbone side", "Top shoulder"]
  },
  {
    id: "front_shoulder_right",
    label: "Right shoulder (front)",
    view: "front",
    x: 160,
    y: 80,
    w: 28,
    h: 26,
    subregions: ["Front shoulder cap", "Collarbone side", "Top shoulder"]
  },
  {
    id: "front_upper_arm_left",
    label: "Left upper arm (front)",
    view: "front",
    x: 45,
    y: 112,
    w: 24,
    h: 54,
    subregions: ["Outer upper arm", "Inner upper arm", "Near elbow"]
  },
  {
    id: "front_upper_arm_right",
    label: "Right upper arm (front)",
    view: "front",
    x: 171,
    y: 112,
    w: 24,
    h: 54,
    subregions: ["Outer upper arm", "Inner upper arm", "Near elbow"]
  },
  {
    id: "front_forearm_left",
    label: "Left forearm (front)",
    view: "front",
    x: 40,
    y: 171,
    w: 24,
    h: 54,
    subregions: ["Upper forearm", "Mid forearm", "Wrist side"]
  },
  {
    id: "front_forearm_right",
    label: "Right forearm (front)",
    view: "front",
    x: 176,
    y: 171,
    w: 24,
    h: 54,
    subregions: ["Upper forearm", "Mid forearm", "Wrist side"]
  },
  {
    id: "front_thigh_left",
    label: "Left thigh (front)",
    view: "front",
    x: 92,
    y: 232,
    w: 26,
    h: 82,
    subregions: ["Upper thigh", "Mid thigh", "Near knee"]
  },
  {
    id: "front_thigh_right",
    label: "Right thigh (front)",
    view: "front",
    x: 122,
    y: 232,
    w: 26,
    h: 82,
    subregions: ["Upper thigh", "Mid thigh", "Near knee"]
  },
  {
    id: "front_knee_left",
    label: "Left knee (front)",
    view: "front",
    x: 92,
    y: 318,
    w: 26,
    h: 24,
    subregions: ["Above kneecap", "Kneecap", "Below kneecap"]
  },
  {
    id: "front_knee_right",
    label: "Right knee (front)",
    view: "front",
    x: 122,
    y: 318,
    w: 26,
    h: 24,
    subregions: ["Above kneecap", "Kneecap", "Below kneecap"]
  },
  {
    id: "front_foot_left",
    label: "Left foot/ankle (front)",
    view: "front",
    x: 89,
    y: 348,
    w: 30,
    h: 54,
    subregions: ["Ankle", "Top of foot", "Toes"]
  },
  {
    id: "front_foot_right",
    label: "Right foot/ankle (front)",
    view: "front",
    x: 121,
    y: 348,
    w: 30,
    h: 54,
    subregions: ["Ankle", "Top of foot", "Toes"]
  },
  {
    id: "back_head_neck",
    label: "Back head/neck",
    view: "back",
    x: 103,
    y: 22,
    w: 34,
    h: 40,
    subregions: ["Upper neck", "Lower neck", "Base of skull"]
  },
  {
    id: "back_upper_left",
    label: "Upper back (left)",
    view: "back",
    x: 74,
    y: 78,
    w: 35,
    h: 34,
    subregions: ["Near shoulder blade", "Spine side", "Outer upper back"]
  },
  {
    id: "back_upper_right",
    label: "Upper back (right)",
    view: "back",
    x: 131,
    y: 78,
    w: 35,
    h: 34,
    subregions: ["Near shoulder blade", "Spine side", "Outer upper back"]
  },
  {
    id: "back_mid_left",
    label: "Mid back (left)",
    view: "back",
    x: 78,
    y: 116,
    w: 32,
    h: 40,
    subregions: ["Rib area", "Spine side", "Outer mid back"]
  },
  {
    id: "back_mid_right",
    label: "Mid back (right)",
    view: "back",
    x: 130,
    y: 116,
    w: 32,
    h: 40,
    subregions: ["Rib area", "Spine side", "Outer mid back"]
  },
  {
    id: "back_lower_left",
    label: "Lower back (left)",
    view: "back",
    x: 82,
    y: 160,
    w: 30,
    h: 42,
    subregions: ["Near spine", "Flank side", "Top of hip"]
  },
  {
    id: "back_lower_right",
    label: "Lower back (right)",
    view: "back",
    x: 128,
    y: 160,
    w: 30,
    h: 42,
    subregions: ["Near spine", "Flank side", "Top of hip"]
  },
  {
    id: "back_glute_left",
    label: "Left glute",
    view: "back",
    x: 92,
    y: 206,
    w: 30,
    h: 34,
    subregions: ["Upper glute", "Center glute", "Outer glute"]
  },
  {
    id: "back_glute_right",
    label: "Right glute",
    view: "back",
    x: 122,
    y: 206,
    w: 30,
    h: 34,
    subregions: ["Upper glute", "Center glute", "Outer glute"]
  },
  {
    id: "back_hamstring_left",
    label: "Left thigh (back)",
    view: "back",
    x: 92,
    y: 244,
    w: 26,
    h: 78,
    subregions: ["Upper hamstring", "Mid hamstring", "Near knee"]
  },
  {
    id: "back_hamstring_right",
    label: "Right thigh (back)",
    view: "back",
    x: 122,
    y: 244,
    w: 26,
    h: 78,
    subregions: ["Upper hamstring", "Mid hamstring", "Near knee"]
  },
  {
    id: "back_calf_left",
    label: "Left calf",
    view: "back",
    x: 92,
    y: 326,
    w: 26,
    h: 50,
    subregions: ["Upper calf", "Mid calf", "Achilles area"]
  },
  {
    id: "back_calf_right",
    label: "Right calf",
    view: "back",
    x: 122,
    y: 326,
    w: 26,
    h: 50,
    subregions: ["Upper calf", "Mid calf", "Achilles area"]
  }
];

export const REGION_INDEX = Object.fromEntries(
  REGION_DEFINITIONS.map((region) => [region.id, region])
);

export function getRegionById(regionId) {
  return REGION_INDEX[regionId] || null;
}

export function getRegionsByView(view) {
  return REGION_DEFINITIONS.filter((region) => region.view === view);
}
