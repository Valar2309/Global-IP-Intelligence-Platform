export default function PatentModal({asset,close}){

  if(!asset) return null;

  return(

    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center"
      onClick={close}
    >

      <div
        className="bg-slate-900 p-6 rounded-xl w-[500px]"
        onClick={(e)=>e.stopPropagation()}
      >

        <h2 className="text-xl font-bold mb-3">
          {asset.title}
        </h2>

        <p className="text-gray-400 mb-4">
          {asset.abstract}
        </p>

        <button
          onClick={close}
          className="bg-indigo-600 px-4 py-2 rounded"
        >
          Close
        </button>

      </div>

    </div>

  );

}