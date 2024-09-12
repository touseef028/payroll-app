// import { updateSettings } from '@/app/lib/actions';
// import  { Settings } from '@/app/lib/definitions';

// export default function SettingsForm({  settings }: { settings: Settings }) {
//   return (
//     <form action={updateSettings}>
//       <div className="rounded-md bg-gray-50 p-4 md:p-6">
//         {/* Day Time Rate */}
//         <div className="mb-4">
//           <label htmlFor="dayTimeRate" className="mb-2 block text-sm font-medium">
//             Day Time Rate (per hour)
//           </label>
//           <input
//             id="dayTimeRate"
//             name="dayTimeRate"
//             type="number"
//             step="0.01"
//             defaultValue={settings.dayTimeRate}
//             className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
//           />
//         </div>

//         {/* Evening Rate */}
//         <div className="mb-4">
//           <label htmlFor="eveRate" className="mb-2 block text-sm font-medium">
//             Evening Time Rate (per hour)
//           </label>
//           <input
//             id="eveRate"
//             name="eveRate"
//             type="number"
//             step="0.01"
//             defaultValue={settings.eveRate}            
//             className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
//           />
//         </div>

//         {/* Day Rate */}
//         <div className="mb-4">
//           <label htmlFor="dayRate" className="mb-2 block text-sm font-medium">
//             Day Rate (per day)
//           </label>
//           <input
//             id="dayRate"
//             name="dayRate"
//             type="number"
//             step="0.01"
//             defaultValue={settings.dayRate}
//             className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
//           />
//         </div>

//         {/* Meeting Rate */}
//         <div className="mb-4">
//           <label htmlFor="meetingRate" className="mb-2 block text-sm font-medium">
//             Meeting Rate (per meeting)
//           </label>
//           <input
//             id="meetingRate"
//             name="meetingRate"
//             type="number"
//             step="0.01"
//             defaultValue={settings.meetingRate}
//             className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
//           />
//         </div>
//       </div>
//       <div className="mt-6 flex justify-end gap-4">
//         <button type="submit" className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600">
//           Update Settings
//         </button>
//       </div>
//     </form>
//   );
// }