export default function RequiredFieldsNotice() {
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 pb-2">
      <span>Fields marked with</span>
      <span className="text-red-500 font-bold">*</span>
      <span>are required</span>
    </div>
  );
}
