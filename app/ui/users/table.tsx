import Image from "next/image";
import { UpdateUser, DeleteUser } from "@/app/ui/users/buttons";
import { formatDateToLocal } from "@/app/lib/utils";
import Search from "../search";
import { lusitana } from "../fonts";
import { fetchFilteredLocs } from "@/app/lib/data";

export default function UsersTable({
  users,
}: {
  users: Array<{
    user_type: string;
    id: string;
    name: string;
    email: string;
    phone_number: string;
    site_name: string;
  }>;
}) {
  return (
    <div className="w-full">
      <div className="mt-6 flow-root">
        <div className="inline-block min-w-full align-middle">
          <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
            <table className="hidden min-w-full text-gray-900 md:table">
              <thead className="rounded-lg text-left text-sm font-normal">
                <tr>
                  <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                    Name
                  </th>
                  <th scope="col" className="px-3 py-5 font-medium">
                    Email
                  </th>
                  <th scope="col" className="px-3 py-5 font-medium">
                    Date of Birth
                  </th>
                  <th scope="col" className="px-3 py-5 font-medium">
                    Phone Number
                  </th>
                  <th scope="col" className="px-3 py-5 font-medium">
                    Site
                  </th>
                  <th scope="col" className="px-3 py-5 font-medium">
                    Type
                  </th>

                  <th scope="col" className="relative py-3 pl-6 pr-3">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {users?.map((user) => (
                  <tr
                    key={user.id}
                    className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
                    {" "}
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      <div className="flex items-center gap-3">
                        <p>{user.name}</p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {user.email}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {user?.date_of_birth
                        ? formatDateToLocal(user?.date_of_birth)
                        : "Not provided"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {user.phone_number}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {user.site_name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {user.user_type}
                    </td>
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      <div className="flex justify-end gap-3">
                        <UpdateUser id={user.id} />
                        <DeleteUser id={user.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
